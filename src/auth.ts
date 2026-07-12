import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Context } from 'hono';
import type { Nutzer } from './types';

const COOKIE = 'bw_session';
// Statischer App-Secret (Demo). In Produktion als Secret setzen.
const SECRET = 'bw-bau-cockpit-2026-secret-key-change-me';

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  // base64url-safe: keine +, /, = -> kein Cookie-Encoding-Mismatch im Browser
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createSession(c: Context, nutzerId: number): Promise<void> {
  const payload = String(nutzerId);
  const sig = await hmac(payload);
  const token = `${payload}.${sig}`;
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // 14 Tage
  });
}

export function clearSession(c: Context): void {
  deleteCookie(c, COOKIE, { path: '/' });
}

export async function getSessionUserId(c: Context): Promise<number | null> {
  const token = getCookie(c, COOKIE);
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.substring(0, idx);
  const sig = token.substring(idx + 1);
  const expected = await hmac(payload);
  if (sig !== expected) return null;
  const id = parseInt(payload, 10);
  return isNaN(id) ? null : id;
}

export async function getCurrentUser(c: Context): Promise<Nutzer | null> {
  const id = await getSessionUserId(c);
  if (!id) return null;
  const db = c.env.DB as D1Database;
  const u = await db.prepare('SELECT id, name, rolle, login, aktiv FROM nutzer WHERE id = ? AND aktiv = 1')
    .bind(id).first<Nutzer>();
  return u || null;
}

export function darfBearbeiten(rolle: string): boolean {
  return rolle === 'GF' || rolle === 'Bauleiter';
}
export function darfEinkauf(rolle: string): boolean {
  return rolle === 'GF' || rolle === 'Einkauf';
}
