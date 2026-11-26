/**
 * Personal collections (favorites, library, wishlist) persisted in LocalStorage.
 * Components subscribe to changes instead of reading storage directly.
 */
import { games } from '../data/games.js';
import { STORAGE_KEY, loadState, saveState } from './storage.js';

export const LISTS = ['favorites', 'library', 'wishlist'];

const validIds = new Set(games.map((game) => game.id));
const listeners = new Set();

function readState() {
  const saved = loadState() ?? {};
  return Object.fromEntries(
    LISTS.map((list) => {
      const ids = Array.isArray(saved[list]) ? saved[list] : [];
      return [list, [...new Set(ids.filter((id) => validIds.has(id)))]];
    }),
  );
}

let state = readState();

const emit = (change) => listeners.forEach((listener) => listener(change));

export const has = (list, id) => state[list].includes(id);
export const count = (list) => state[list].length;

/** Ids in a list, most recently added first. */
export const ids = (list) => [...state[list]].reverse();

/** Add or remove a game. Returns the new membership (true = now in list). */
export function toggle(list, id) {
  if (!LISTS.includes(list) || !validIds.has(id)) return false;
  const active = !has(list, id);
  state = {
    ...state,
    [list]: active ? [...state[list], id] : state[list].filter((item) => item !== id),
  };
  saveState(state);
  emit({ list, id, active });
  return active;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Keep several open tabs in sync.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  state = readState();
  emit({ list: null });
});
