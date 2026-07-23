import crypto from 'crypto';
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

const COOKIE_NAME = 'sonor_admin';
const MAX_AGE_SECONDS = 60 * 60 * 8;
const IS_PROD = process.env.NODE_ENV === 'production';

// A per-process random fallback so production never signs sessions with a
// known constant when ADMIN_SESSION_SECRET is missing.
const RANDOM_SECRET = crypto.randomBytes(32).toString('hex');

const getSecret = () =>
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  (IS_PROD ? RANDOM_SECRET : 'sonor-local-admin-secret');

const base64url = (value: string | Buffer) =>
  Buffer.from(value).toString('base64url');

const sign = (payload: string) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

const parseCookies = (cookieHeader?: string) => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [rawName, ...rawValue] = cookie.trim().split('=');
    if (!rawName) return;
    cookies[rawName] = decodeURIComponent(rawValue.join('='));
  });

  return cookies;
};

export const getAdminCredentials = () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // In production, never fall back to weak defaults — an unset password makes
  // login impossible until real credentials are configured.
  if (IS_PROD && (!username || !password)) {
    return { username: '\0', password: crypto.randomBytes(32).toString('hex') };
  }

  return {
    username: username || 'admin',
    password: password || 'admin123',
  };
};

export const createAdminCookie = (username: string) => {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = base64url(JSON.stringify({ username, expiresAt }));
  const token = `${payload}.${sign(payload)}`;

  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
};

export const clearAdminCookie = () =>
  `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

export const readAdminSession = (cookieHeader?: string) => {
  const token = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      username: string;
      expiresAt: number;
    };

    if (!session.username || Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
};

export const isAdminRequest = (req: NextApiRequest | GetServerSidePropsContext['req']) =>
  Boolean(readAdminSession(req.headers.cookie));

export const requireAdmin = (req: NextApiRequest, res: NextApiResponse) => {
  if (isAdminRequest(req)) return true;
  res.status(401).json({ message: 'Админ эрх шаардлагатай.' });
  return false;
};
