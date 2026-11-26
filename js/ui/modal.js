import { esc, qs } from '../core/dom.js';
import { getGame } from '../data/games.js';
import { createActionButton } from './actions.js';
import { createArt } from './art.js';

/** Where the details were opened from, so "Back to …" matches the user's context. */
const ORIGINS = { home: 'Home', discover: 'Discover', library: 'Library', wishlist: 'Wishlist' };
const DEFAULT_ORIGIN = 'discover';

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
const formatDate = (iso) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

function verdict(rating) {
  if (rating >= 9.5) return 'Exceptional';
  if (rating >= 9) return 'Excellent';
  if (rating >= 8) return 'Very good';
  return 'Good';
}

/** Game details dialog (native <dialog>: focus trap, Esc to close, backdrop click). */
export function initModal() {
  const dialog = qs('#game-modal');
  const media = qs('[data-modal-media]', dialog);
  const actions = qs('[data-modal-actions]', dialog);
  const meter = qs('[data-modal-meter]', dialog);
  const text = (name, value) => {
    qs(`[data-modal-${name}]`, dialog).textContent = value;
  };

  let origin = DEFAULT_ORIGIN;

  function open(id, from = DEFAULT_ORIGIN) {
    const game = getGame(id);
    if (!game) return;
    origin = from in ORIGINS ? from : DEFAULT_ORIGIN;

    const [, mid] = game.palette;
    dialog.style.setProperty('--tint', mid); // per-game ambient glow

    media.replaceChildren(createArt(game, { alt: `${game.title} cover art`, eager: true }));
    text('back-label', `Back to ${ORIGINS[origin]}`);
    text('genre', game.genre);
    text('title', game.title);
    text('rating', game.rating.toFixed(1));
    text('verdict', verdict(game.rating));
    text('date', formatDate(game.releaseDate));
    text('year', game.year);
    text('developer', game.developer);
    text('publisher', game.publisher);
    text('desc', game.description);
    qs('[data-modal-platforms]', dialog).innerHTML = game.platforms
      .map((platform) => `<li class="tag tag--platform">${esc(platform)}</li>`)
      .join('');

    actions.replaceChildren(
      createActionButton('library', game, { variant: 'labeled' }),
      createActionButton('wishlist', game, { variant: 'labeled' }),
      createActionButton('favorites', game, { variant: 'labeled' }),
    );

    meter.style.width = '0%';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('is-locked');
    qs('.modal__panel', dialog).scrollTop = 0;
    requestAnimationFrame(() => {
      meter.style.width = `${game.rating * 10}%`;
    });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('is-locked');
    // If the opening card was removed meanwhile (e.g. un-listed from Library), keep focus sensible.
    if (!document.activeElement || document.activeElement === document.body) {
      document.querySelector(`#${origin} .panel:not([hidden])`)?.focus({ preventScroll: true });
    }
  });

  // Clicking the backdrop targets the <dialog> itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  qs('[data-modal-close]', dialog).addEventListener('click', close);
  qs('[data-modal-back]', dialog).addEventListener('click', close);

  // Any element with data-open-id opens the details for that game.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-id]');
    if (!trigger) return;
    open(trigger.dataset.openId, trigger.closest('section[id]')?.id);
  });

  return { open, close };
}
