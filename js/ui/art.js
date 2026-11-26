import { esc } from '../core/dom.js';

/**
 * Cover artwork with a graceful fallback: the wrapper always shows the game's
 * colour gradient, and if the image fails to load it is replaced by a
 * title card so the layout never breaks.
 */
export function createArt(game, { alt = '', eager = false } = {}) {
  const [c1, c2, c3] = game.palette;
  const wrap = document.createElement('div');
  wrap.className = 'art';
  wrap.style.cssText = `--c1:${c1};--c2:${c2};--c3:${c3}`;

  const img = new Image();
  img.alt = alt;
  img.width = 600;
  img.height = 900;
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  img.addEventListener(
    'error',
    () => {
      img.remove();
      wrap.insertAdjacentHTML(
        'beforeend',
        `<div class="art__fallback"><span>${esc(game.genre)}</span><strong>${esc(game.title)}</strong></div>`,
      );
    },
    { once: true },
  );
  img.src = game.cover;
  wrap.append(img);
  return wrap;
}
