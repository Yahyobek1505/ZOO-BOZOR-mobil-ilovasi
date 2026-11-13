import type { Request, RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { db, authIdentitiesTable, eq } from '@workspace/db';
import { clerkClient } from '@clerk/express';

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
export class AuthError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export type FirebaseClaims = JWTPayload & { sub: string; email: string; email_verified: true; firebase?: { sign_in_provider?: string } };
export type RequestIdentity = { firebaseUid: string; accountId: string; email: string };
const identities = new WeakMap<Request, RequestIdentity>();

export async function verifyFirebaseToken(token: string): Promise<FirebaseClaims> {
  const project = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!project) throw new AuthError(503, 'Firebase sozlamalari topilmadi.');
  try {
    const { payload } = await jwtVerify(token, googleKeys, {
      issuer: `https://securetoken.google.com/${project}`,
      audience: project,
      algorithms: ['RS256'],
      maxTokenAge: '65m',
    });
    if (!payload.sub || payload.sub.length > 128 || typeof payload.email !== 'string') throw new AuthError(401, 'Hisob maʼlumoti notoʻgʻri.');
    if (payload.email_verified !== true) throw new AuthError(403, 'Avval elektron pochtangizni tasdiqlang.');
    return payload as FirebaseClaims;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(401, 'Kirish muddati tugagan yoki tasdiqlanmagan. Qaytadan kiring.');
  }
}

async function marketplaceAccount(claims: FirebaseClaims): Promise<string> {
  const [known] = await db.select().from(authIdentitiesTable).where(eq(authIdentitiesTable.firebaseUid, claims.sub)).limit(1);
  if (known) return known.accountId;

  // Read-only legacy lookup, never copy a password or trust a client-supplied ID.
  // Keep these managed keys until old verified accounts have been linked.
  // LEGACY_CLERK_LOOKUP=off is only for a fresh database that never had Clerk users;
  // by default a missing key still blocks sign-up so legacy accounts cannot be split.
  let matches: { id: string }[] = [];
  if (process.env.LEGACY_CLERK_LOOKUP !== 'off') {
    if (!process.env.CLERK_SECRET_KEY) throw new AuthError(503, 'Oldingi hisoblarni bogʻlash sozlamasi topilmadi. Maʼlumotlaringiz oʻchirilmagan.');
    const legacy = await clerkClient.users.getUserList({ emailAddress: [claims.email], limit: 2 });
    matches = legacy.data.filter((user) => user.emailAddresses.some((email) =>
      email.emailAddress.toLowerCase() === claims.email.toLowerCase() && email.verification?.status === 'verified'));
  }
  if (matches.length > 1) throw new AuthError(409, 'Bu email bir nechta oldingi hisobga bogʻlangan. Hisobni alohida tekshirish kerak.');
  const accountId = matches[0]?.id ?? `firebase_${claims.sub}`;
  try {
    await db.insert(authIdentitiesTable).values({ firebaseUid: claims.sub, accountId }).onConflictDoNothing();
    const [saved] = await db.select().from(authIdentitiesTable).where(eq(authIdentitiesTable.firebaseUid, claims.sub)).limit(1);
    if (!saved) throw new AuthError(409, 'Bu email boshqa Firebase hisobiga bogʻlangan. Avval mavjud hisobingizga kiring.');
    return saved.accountId;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(503, 'Hisobni bogʻlab boʻlmadi. Qayta urinib koʻring; maʼlumotlaringiz saqlanib turibdi.');
  }
}

export function getRequestIdentity(req: Request): RequestIdentity {
  const identity = identities.get(req);
  if (!identity) throw new AuthError(401, 'Avval hisobingizga kiring.');
  return identity;
}

export const requireFirebaseAuth: RequestHandler = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token || token.length > 16000) throw new AuthError(401, 'Avval hisobingizga kiring.');
    const claims = await verifyFirebaseToken(token);
    const identity = { firebaseUid: claims.sub, email: claims.email, accountId: await marketplaceAccount(claims) };
    identities.set(req, identity);
    res.locals.identity = identity;
    next();
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 503;
    res.status(status).json({ error: error instanceof AuthError ? error.message : 'Hisobni tekshirib boʻlmadi. Qayta urinib koʻring.' });
  }
};
