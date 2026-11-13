import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

// Netlify sync functions accept ~6 MB request bodies, sent base64-encoded, so raw files above
// ~4.5 MB never reach the API. Keep a margin.
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export type ImageInfo = { size: number; contentType: string };

// On Netlify images live in Netlify Blobs; elsewhere (local `pnpm dev`) in a folder next to the
// API, so uploads can be tried without a cloud account.
let netlify = false;
export function useNetlifyBlobs() { netlify = true; }

const localDir = () => path.resolve(process.cwd(), ".data", "listing-images");

function key(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid image ID");
  return id;
}

export async function saveImage(id: string, data: Buffer, contentType: string) {
  const info: ImageInfo = { size: data.length, contentType };
  if (netlify) {
    const bytes = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    await getStore("listing-images").set(key(id), bytes, { metadata: info });
    return;
  }
  await mkdir(localDir(), { recursive: true });
  await writeFile(path.join(localDir(), key(id)), data);
  await writeFile(path.join(localDir(), `${key(id)}.json`), JSON.stringify(info));
}

export async function imageInfo(id: string): Promise<ImageInfo | null> {
  if (netlify) {
    const found = await getStore("listing-images").getMetadata(key(id));
    return found ? (found.metadata as ImageInfo) : null;
  }
  try {
    return JSON.parse(await readFile(path.join(localDir(), `${key(id)}.json`), "utf8")) as ImageInfo;
  } catch {
    return null;
  }
}

export async function readImage(id: string): Promise<{ data: Buffer; contentType: string } | null> {
  if (netlify) {
    const found = await getStore("listing-images").getWithMetadata(key(id), { type: "arrayBuffer" });
    if (!found) return null;
    return { data: Buffer.from(found.data), contentType: (found.metadata as ImageInfo).contentType };
  }
  const info = await imageInfo(id);
  if (!info) return null;
  return { data: await readFile(path.join(localDir(), key(id))), contentType: info.contentType };
}
