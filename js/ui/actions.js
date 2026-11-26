/**
 * Favorite / Library / Wishlist toggle buttons.
 * One factory builds every button, one delegated listener handles every click,
 * and `syncActionButtons` keeps all visible buttons in step with the store.
 */
import { getGame } from '../data/games.js';
import { has, subscribe, toggle } from '../core/store.js';
import { icon } from './icons.js';
import { showToast } from './toast.js';

export const ACTIONS = {
  favorites: { icon: 'heart', name: 'Favorites', label: 'Favorite', add: 'Add to Favorites', on: 'Favorited' },
  library: { icon: 'library', name: 'Library', label: 'Library', add: 'Add to Library', on: 'In Library' },
  wishlist: { icon: 'bookmark', name: 'Wishlist', label: 'Wishlist', add: 'Add to Wishlist', on: 'On Wishlist' },
};

/**
 * @param {'favorites'|'library'|'wishlist'} list
 * @param {{id:string,title:string}} game
 * @param {{variant?: 'icon'|'labeled'}} options
 */
export function createActionButton(list, game, { variant = 'icon' } = {}) {
  const meta = ACTIONS[list];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `action-btn action-btn--${variant}`;
  button.dataset.action = list;
  button.dataset.id = game.id;

  if (variant === 'icon') {
    // Stable accessible name + aria-pressed (state is announced separately).
    button.setAttribute('aria-label', `${meta.label}: ${game.title}`);
    button.innerHTML = icon(meta.icon, 18);
  } else {
    button.innerHTML = `${icon(meta.icon, 18)}<span data-action-label></span>`;
  }
  syncButton(button);
  return button;
}

function syncButton(button) {
  const { action, id } = button.dataset;
  const meta = ACTIONS[action];
  const active = has(action, id);
  button.classList.toggle('is-active', active);

  if (button.classList.contains('action-btn--icon')) {
    button.setAttribute('aria-pressed', String(active));
    button.title = active ? `Remove from ${meta.name}` : meta.add;
  } else {
    button.querySelector('[data-action-label]').textContent = active ? meta.on : meta.add;
    button.title = active ? `Remove from ${meta.name}` : meta.add;
  }
}

export function syncActionButtons(root = document) {
  root.querySelectorAll('[data-action][data-id]').forEach(syncButton);
}

export function initActions() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action][data-id]');
    if (!button) return;
    const { action, id } = button.dataset;
    const game = getGame(id);
    if (!game || !ACTIONS[action]) return;

    const active = toggle(action, id);
    const name = ACTIONS[action].name;
    showToast(`${game.title} ${active ? 'added to' : 'removed from'} ${name}`);
  });

  subscribe(() => syncActionButtons());
}
