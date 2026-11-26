import { qs, qsa } from '../core/dom.js';
import { getGame } from '../data/games.js';
import { LISTS, count, ids, subscribe } from '../core/store.js';
import { createGameCard } from './card.js';

/** Library / Favorites / Wishlist grids, live counters and the library tabs. */
export function initCollections() {
  /** Re-render one collection, keeping keyboard focus somewhere sensible. */
  function renderList(list) {
    const grid = qs(`[data-grid="${list}"]`);
    const empty = qs(`[data-empty="${list}"]`);
    const hadFocus = grid.contains(document.activeElement);
    const items = ids(list).map(getGame).filter(Boolean);

    grid.replaceChildren(...items.map((game, index) => createGameCard(game, index)));
    grid.hidden = items.length === 0;
    empty.hidden = items.length > 0;

    // The focused button may have just been removed from this list.
    if (hadFocus && !grid.contains(document.activeElement)) {
      const panel = grid.closest('[role="tabpanel"], .panel');
      panel?.focus({ preventScroll: true });
    }
  }

  function updateCounts() {
    qsa('[data-count]').forEach((el) => {
      const total = count(el.dataset.count);
      el.textContent = total;
      if ('hideZero' in el.dataset) el.hidden = total === 0;
    });
  }

  function renderAll() {
    LISTS.forEach(renderList);
    updateCounts();
  }

  subscribe((change) => {
    if (change.list) renderList(change.list);
    else LISTS.forEach(renderList);
    updateCounts();
  });
  renderAll();

  initTabs();
}

/** Accessible tabs (arrow keys, Home/End) for Library ↔ Favorites. */
function initTabs() {
  const tabs = qsa('[data-tab]');

  function select(tab, { focus = false } = {}) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      qs(`#${item.getAttribute('aria-controls')}`).hidden = !active;
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab)));

  qs('.tabs').addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const moves = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(tabs[moves[event.key]], { focus: true });
  });
}
