/**
 * Origin of the API server, built from EXPO_PUBLIC_DOMAIN.
 *
 * - "api.example.uz"            -> "https://api.example.uz"
 * - "localhost:5000"            -> "http://localhost:5000" (local development)
 * - "192.168.1.20:5000"         -> "http://192.168.1.20:5000" (phone on the same Wi-Fi)
 * - "http://anything" / "https://anything" is used as written.
 *
 * Returns null when the variable is empty, so callers can show "not configured".
 */
export function apiOrigin(): string | null {
  const raw = process.env.EXPO_PUBLIC_DOMAIN?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  const local = /^(localhost|127\.0\.0\.1|\[::1\]|10\.\d|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(raw);
  return `${local ? 'http' : 'https'}://${raw.replace(/\/+$/, '')}`;
}

/** Absolute URL for an API path such as "/api/storage/images/…". */
export function apiUrl(path: string): string {
  const origin = apiOrigin();
  return origin ? `${origin}${path}` : path;
}
