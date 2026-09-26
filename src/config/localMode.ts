/** Client demo: frontend runs entirely from localStorage. No backend calls. */
export const LOCAL_ONLY = true;

export const LOCAL_DEMO_PASSWORD = 'Apex#Demo2026';

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

export function verifyLocalPassword(email: string, password: string) {
  if (password === LOCAL_DEMO_PASSWORD) return true;
  const stored = readPasswords()[email.trim().toLowerCase()];
  return Boolean(stored) && password === stored;
}
