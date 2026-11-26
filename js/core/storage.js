/**
 * Safe LocalStorage wrapper. Storage can be unavailable (private mode,
 * blocked cookies) or contain corrupt data, so every call is guarded and the
 * app keeps working in memory when persistence fails.
 */
export const STORAGE_KEY = 'gamevault:v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
