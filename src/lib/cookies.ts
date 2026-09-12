import { UserProfile } from '@/types/finance';

const SESSION_COOKIE_NAME = 'dompetku_user_session';
const DEFAULT_COOKIE_DAYS = 90; // Sesi aktif selama 90 hari

export function setCookie(name: string, value: string, days: number = DEFAULT_COOKIE_DAYS): void {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length));
      } catch {
        return c.substring(nameEQ.length);
      }
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

export function saveUserSession(user: UserProfile): void {
  try {
    const serialized = JSON.stringify(user);
    setCookie(SESSION_COOKIE_NAME, serialized, DEFAULT_COOKIE_DAYS);
  } catch (err) {
    console.error('Gagal menyimpan sesi cookie:', err);
  }
}

export function getUserSession(): UserProfile | null {
  try {
    const raw = getCookie(SESSION_COOKIE_NAME);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function clearUserSession(): void {
  deleteCookie(SESSION_COOKIE_NAME);
}
