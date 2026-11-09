import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db, listingsTable, listingImagesTable, and, desc, eq, sql, type StoredListing } from "@workspace/db";
import { CreateListingBody, RequestListingUploadBody } from "@workspace/api-zod";
import { imageFile, imageUploadUrl } from "../lib/listingStorage";
import { getRequestIdentity, requireFirebaseAuth } from "../lib/firebase-auth";

const router = Router();
const serialize = (row: StoredListing) => ({
  ...row.data, id: row.id, ownerId: row.ownerId,
  createdAt: row.createdAt.getTime(), rating: 0, views: 0,
});

router.get("/listings", async (_req, res) => {
  const rows = await db.select().from(listingsTable).orderBy(desc(listingsTable.createdAt));
  res.json(rows.map(serialize));
});

router.get("/listings/:id", async (req, res) => {
  const [row] = await db.select().from(listingsTable).where(eq(listingsTable.id, req.params.id));
  if (!row) { res.status(404).json({ error: "Eʼlon topilmadi." }); return; }
  res.json(serialize(row));
});

router.post("/storage/uploads/request-url", requireFirebaseAuth, async (req, res) => {
  const ownerId = getRequestIdentity(req).accountId;
  if (!ownerId) { res.status(401).json({ error: "Avval hisobingizga kiring." }); return; }
  const parsed = RequestListingUploadBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Rasm turi yoki hajmi notoʻgʻri (eng koʻpi 10 MB)." }); return; }
  const id = randomUUID();
  const uploadURL = await imageUploadUrl(id);
  await db.insert(listingImagesTable).values({
    id, ownerId, contentType: parsed.data.contentType, size: String(parsed.data.size),
  });
  res.json({ uploadURL, objectPath: `/api/storage/images/${id}` });
});

router.get("/storage/images/:id", async (req, res) => {
  const id = req.params.id;
  if (!/^[a-f0-9-]{36}$/.test(id)) { res.sendStatus(404); return; }
  const path = `/api/storage/images/${id}`;
  // Staged uploads are not public. Only images attached to a published listing are served.
  const [listing] = await db.select({ id: listingsTable.id }).from(listingsTable)
    .where(sql`${listingsTable.data}->'images' @> ${JSON.stringify([path])}::jsonb`).limit(1);
  if (!listing) { res.sendStatus(404); return; }
  const file = imageFile(id);
  const [exists] = await file.exists();
  if (!exists) { res.sendStatus(404); return; }
  const [metadata] = await file.getMetadata();
  res.set({
    "Content-Type": metadata.contentType || "application/octet-stream",
    "Cache-Control": "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  });
  file.createReadStream().on("error", (err) => {
    req.log.error({ err }, "Image stream failed");
    if (!res.headersSent) res.sendStatus(500); else res.destroy();
  }).pipe(res);
});

router.post("/listings", requireFirebaseAuth, async (req, res) => { await save(req, res, false); });
router.put("/listings/:id", requireFirebaseAuth, async (req, res) => { await save(req, res, true); });

async function save(req: import("express").Request, res: import("express").Response, editing: boolean) {
  const ownerId = getRequestIdentity(req).accountId;
  if (!ownerId) { res.status(401).json({ error: "Avval hisobingizga kiring." }); return; }
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Eʼlon maʼlumotlarini tekshiring.", issues: parsed.error.flatten() }); return; }
  const data = parsed.data;
  if (editing && req.params.id !== data.id) { res.sendStatus(400); return; }
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, data.id));
  if (existing && existing.ownerId !== ownerId) { res.status(403).json({ error: "Bu eʼlon sizga tegishli emas." }); return; }
  if (editing && !existing) { res.status(404).json({ error: "Eʼlon topilmadi." }); return; }
  // Stable client IDs make retry/import safe, including a lost response after commit.
  if (!editing && existing) { res.status(201).json(serialize(existing)); return; }
  for (const path of data.images) {
    const id = path.split("/").pop()!;
    const [image] = await db.select().from(listingImagesTable)
      .where(and(eq(listingImagesTable.id, id), eq(listingImagesTable.ownerId, ownerId)));
    if (!image) { res.status(400).json({ error: "Faqat oʻzingiz yuklagan rasmlarni qoʻshing." }); return; }
    const file = imageFile(id);
    const [exists] = await file.exists();
    if (!exists) { res.status(400).json({ error: "Rasm hali yuklanmagan. Qayta urinib koʻring." }); return; }
    const [metadata] = await file.getMetadata();
    if (Number(metadata.size) !== Number(image.size) || metadata.contentType !== image.contentType) {
      res.status(400).json({ error: "Yuklangan rasm hajmi yoki turi mos emas." }); return;
    }
  }
  if (editing) {
    const [row] = await db.update(listingsTable).set({ data })
      .where(and(eq(listingsTable.id, data.id), eq(listingsTable.ownerId, ownerId))).returning();
    if (!row) { res.sendStatus(404); return; }
    res.json(serialize(row));
  } else {
    const [inserted] = await db.insert(listingsTable).values({ id: data.id, ownerId, data })
      .onConflictDoNothing().returning();
    const row = inserted ?? (await db.select().from(listingsTable).where(eq(listingsTable.id, data.id)))[0];
    if (!row || row.ownerId !== ownerId) { res.sendStatus(403); return; }
    res.status(201).json(serialize(row));
  }
}

router.delete("/listings/:id", requireFirebaseAuth, async (req, res) => {
  const ownerId = getRequestIdentity(req).accountId;
  if (!ownerId) { res.status(401).json({ error: "Avval hisobingizga kiring." }); return; }
  if (typeof req.params.id !== "string") { res.sendStatus(400); return; }
  const [row] = await db.select().from(listingsTable).where(eq(listingsTable.id, req.params.id));
  if (!row) { res.sendStatus(404); return; }
  if (row.ownerId !== ownerId) { res.status(403).json({ error: "Bu eʼlon sizga tegishli emas." }); return; }
  await db.delete(listingsTable).where(and(eq(listingsTable.id, row.id), eq(listingsTable.ownerId, ownerId)));
  res.sendStatus(204);
});

export default router;
