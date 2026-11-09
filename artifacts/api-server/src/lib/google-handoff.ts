import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

type Handoff = { idToken: string; challenge: string; state: string; expires: number };
const hex64 = /^[a-f0-9]{64}$/;
const key = (secret: string) => createHash('sha256').update(`zoo-bozor/firebase-handoff/v1/${secret}`).digest();

export function allowedReturnUrl(raw: string, expoHost?: string): URL {
  const url = new URL(raw);
  const standalone = url.protocol === 'zoo-bozor:' && (
    (url.hostname === 'sso-callback' && (url.pathname === '' || url.pathname === '/'))
    || (url.hostname === '' && url.pathname === '/sso-callback')
  );
  const expo = url.protocol === 'exp:' && !!expoHost && url.host === expoHost && url.pathname === '/--/sso-callback';
  if ((!standalone && !expo) || url.username || url.password || url.search || url.hash) throw new Error('Invalid return URL');
  return url;
}

export function sealGoogleHandoff(data: Omit<Handoff, 'expires'>, secret: string, now = Date.now()) {
  if (!secret || !hex64.test(data.challenge) || !hex64.test(data.state)) throw new Error('Invalid handoff');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify({ ...data, expires: now + 120_000 }), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url');
}

export function openGoogleHandoff(value: string, verifier: string, state: string, secret: string, now = Date.now()): string {
  if (!secret || !hex64.test(verifier) || !hex64.test(state) || value.length > 24000) throw new Error('Invalid proof');
  const bytes = Buffer.from(value, 'base64url');
  if (bytes.length < 29) throw new Error('Invalid handoff');
  const decipher = createDecipheriv('aes-256-gcm', key(secret), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  const data = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')) as Handoff;
  const challenge = createHash('sha256').update(verifier).digest('hex');
  if (!hex64.test(data.challenge) || !hex64.test(data.state) || !Number.isFinite(data.expires)
    || data.expires < now || data.expires > now + 120_000
    || !timingSafeEqual(Buffer.from(challenge), Buffer.from(data.challenge))
    || !timingSafeEqual(Buffer.from(state), Buffer.from(data.state))
    || typeof data.idToken !== 'string' || !data.idToken) throw new Error('Expired or incorrect proof');
  return data.idToken;
}
