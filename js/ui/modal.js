import { qs } from '../core/dom.js';
import { getGame } from '../data/games.js';
import { createActionButton } from './actions.js';
import { createArt } from './art.js';

/** Game details dialog (native <dialog>: focus trap, Esc to close, backdrop). */
export function initModal() {
  const dialog = qs('#game-modal');
  const media = qs('[data-modal-media]', dialog);
  const actions = qs('[data-modal-actions]', dialog);
  const text = (selector, value) => {
    qs(selector, dialog).textContent = value;
  };

  function open(id) {
    const game = getGame(id);
    if (!game) return;

    media.replaceChildren(createArt(game, { alt: `${game.title} cover art`, eager: true }));
    text('[data-modal-title]', game.title);
    text('[data-modal-genre]', game.genre);
    text('[data-modal-year]', game.year);
    text('[data-modal-rating]', `${game.rating.toFixed(1)} / 10`);
    text('[data-modal-desc]', `${game.description} Developed by ${game.developer}.`);
    actions.replaceChildren(
      createActionButton('library', game, { variant: 'labeled' }),
      createActionButton('wishlist', game, { variant: 'labeled' }),
      createActionButton('favorites', game, { variant: 'labeled' }),
    );

    const meter = qs('[data-modal-meter]', dialog);
    meter.style.width = '0%';

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('is-locked');
    dialog.scrollTop = 0;
    requestAnimationFrame(() => {
      meter.style.width = `${game.rating * 10}%`;
    });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => document.documentElement.classList.remove('is-locked'));

  // Clicking the backdrop targets the <dialog> itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  qs('[data-modal-close]', dialog).addEventListener('click', close);

  // Any element with data-open-id opens the details for that game.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-id]');
    if (trigger) open(trigger.dataset.openId);
  });

  return { open, close };
}
