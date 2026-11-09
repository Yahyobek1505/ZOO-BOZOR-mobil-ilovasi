import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CreateGoogleHandoffBody, RedeemGoogleHandoffBody } from '@workspace/api-zod';
import { AuthError, getRequestIdentity, requireFirebaseAuth, verifyFirebaseToken } from '../lib/firebase-auth';
import { allowedReturnUrl, openGoogleHandoff, sealGoogleHandoff } from '../lib/google-handoff';

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, validate: { xForwardedForHeader: false } });
router.use('/auth', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
router.get('/auth/session', requireFirebaseAuth, (req, res) => { res.json(getRequestIdentity(req)); });

router.post('/auth/google/handoff', limiter, async (req, res) => {
  const parsed = CreateGoogleHandoffBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Google kirish soʻrovi notoʻgʻri.' }); return; }
  const secret = process.env.SESSION_SECRET;
  if (!secret) { res.status(503).json({ error: 'Kirish serveri sozlanmagan.' }); return; }
  try {
    const body = parsed.data;
    const target = allowedReturnUrl(body.returnUrl, process.env.REPLIT_EXPO_DEV_DOMAIN);
    const claims = await verifyFirebaseToken(body.firebaseIdToken);
    if (claims.firebase?.sign_in_provider !== 'google.com' || typeof claims.auth_time !== 'number' || claims.auth_time < Date.now() / 1000 - 300) {
      throw new AuthError(401, 'Google hisobingizni yangidan tasdiqlang.');
    }
    const handoff = sealGoogleHandoff({ idToken: body.googleIdToken, challenge: body.codeChallenge, state: body.state }, secret);
    target.hash = new URLSearchParams({ handoff, state: body.state }).toString();
    res.json({ returnUrl: target.toString() });
  } catch (error) {
    res.status(error instanceof AuthError ? error.status : 400).json({ error: error instanceof AuthError ? error.message : 'Google kirish soʻrovini tasdiqlab boʻlmadi.' });
  }
});

router.post('/auth/google/redeem', limiter, (req, res) => {
  const parsed = RedeemGoogleHandoffBody.safeParse(req.body);
  const secret = process.env.SESSION_SECRET;
  if (!parsed.success || !secret) { res.status(400).json({ error: 'Google kirish soʻrovi notoʻgʻri.' }); return; }
  try {
    const { handoff, verifier, state } = parsed.data;
    res.json({ idToken: openGoogleHandoff(handoff, verifier, state, secret) });
  } catch {
    res.status(400).json({ error: 'Kirish soʻrovi eskirgan yoki boshqa qurilmaga tegishli. Qayta urinib koʻring.' });
  }
});
export default router;
