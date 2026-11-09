import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { allowedReturnUrl, openGoogleHandoff, sealGoogleHandoff } from '../src/lib/google-handoff.ts';

const secret = 'unit-test-only-not-an-application-secret';
const verifier = 'a'.repeat(64);
const state = 'b'.repeat(64);
const challenge = createHash('sha256').update(verifier).digest('hex');
const now = 1_700_000_000_000;

test('native Google handoff is encrypted and can only be opened with the device proof', () => {
  const handoff = sealGoogleHandoff({ idToken: 'test-only-credential', challenge, state }, secret, now);
  assert.equal(handoff.includes('test-only-credential'), false);
  assert.equal(openGoogleHandoff(handoff, verifier, state, secret, now + 1000), 'test-only-credential');
  assert.throws(() => openGoogleHandoff(handoff, 'c'.repeat(64), state, secret, now));
  assert.throws(() => openGoogleHandoff(handoff, verifier, 'd'.repeat(64), secret, now));
  assert.throws(() => openGoogleHandoff(handoff, verifier, state, 'different-secret', now));
  assert.throws(() => openGoogleHandoff(handoff, verifier, state, secret, now + 120_001));
  assert.throws(() => openGoogleHandoff('not-a-handoff', verifier, state, secret, now));
});

test('tampering with the encrypted credential is rejected', () => {
  const value = sealGoogleHandoff({ idToken: 'test-only-credential', challenge, state }, secret, now);
  const bytes = Buffer.from(value, 'base64url');
  bytes[bytes.length - 1] ^= 1;
  assert.throws(() => openGoogleHandoff(bytes.toString('base64url'), verifier, state, secret, now));
});

test('Google return URIs never become an arbitrary redirect', () => {
  assert.equal(allowedReturnUrl('zoo-bozor://sso-callback').protocol, 'zoo-bozor:');
  assert.equal(allowedReturnUrl('exp://preview.example/--/sso-callback', 'preview.example').host, 'preview.example');
  for (const url of ['https://evil.example', 'javascript:alert(1)', 'zoo-bozor://other-page', 'zoo-bozor://sso-callback?token=bad', 'zoo-bozor://sso-callback#bad', 'exp://evil.example/--/sso-callback']) {
    assert.throws(() => allowedReturnUrl(url, 'preview.example'));
  }
});
