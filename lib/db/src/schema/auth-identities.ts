import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

/** Stable IDs preserve ownership when an existing Clerk user moves to Firebase. */
export const authIdentitiesTable = pgTable('auth_identities', {
  firebaseUid: text('firebase_uid').primaryKey(),
  accountId: text('account_id').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const insertAuthIdentitySchema = createInsertSchema(authIdentitiesTable).omit({ createdAt: true });
export type InsertAuthIdentity = z.infer<typeof insertAuthIdentitySchema>;
export type AuthIdentity = typeof authIdentitiesTable.$inferSelect;
