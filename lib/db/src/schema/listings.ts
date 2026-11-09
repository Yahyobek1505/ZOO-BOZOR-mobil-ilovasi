import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const listingsTable = pgTable("listings", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertListingSchema = createInsertSchema(listingsTable).omit({ createdAt: true });
export type StoredListing = typeof listingsTable.$inferSelect;

export const listingImagesTable = pgTable("listing_images", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  contentType: text("content_type").notNull(),
  size: text("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertListingImageSchema = createInsertSchema(listingImagesTable).omit({ createdAt: true });
export type StoredListingImage = typeof listingImagesTable.$inferSelect;
