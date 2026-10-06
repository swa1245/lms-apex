/** Client demo: frontend runs entirely from localStorage. No backend calls. */
export const LOCAL_ONLY = true;

export const LOCAL_DEMO_PASSWORD = 'Apex#Demo2026';

export const DEMO_STUDENT_EMAIL = 'aarav.shah@apexschool.edu';

if (LOCAL_ONLY && typeof localStorage !== 'undefined') {
  localStorage.removeItem('smartlearning_auth_token');
}

const PASSWORD_KEY = 'cms_local_passwords';

function readPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORD_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function setLocalPassword(email: string, password: string) {
  const map = readPasswords();
  map[email.trim().toLowerCase()] = password;
  localStorage.setItem(PASSWORD_KEY, JSON.stringify(map));
}

export function getLocalPassword(email: string) {
  return readPasswords()[email.trim().toLowerCase()] || '';
}

export function verifyLocalPassword(email: string, password: string, role?: string) {
  const stored = readPasswords()[email.trim().toLowerCase()];
  if (role === 'student') {
    if (stored) return password === stored;
    return password === LOCAL_DEMO_PASSWORD;
  }
  if (password === LOCAL_DEMO_PASSWORD) return true;
  return Boolean(stored) && password === stored;
}
