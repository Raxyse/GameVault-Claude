import { esc } from '../core/dom.js';
import { createActionButton } from './actions.js';
import { createArt } from './art.js';
import { icon } from './icons.js';

/** Build a game card: cover, rating, title, genre, year, collection actions. */
export function createGameCard(game, index = 0) {
  const item = document.createElement('li');
  item.className = 'game-card';
  item.style.setProperty('--i', index);

  item.innerHTML = `
    <button class="game-card__open" type="button" data-open-id="${esc(game.id)}" aria-label="View details: ${esc(game.title)}">
      <span class="game-card__art" data-art>
        <span class="game-card__rating">${icon('star', 13)}${game.rating.toFixed(1)}</span>
      </span>
      <span class="game-card__body">
        <span class="game-card__title">${esc(game.title)}</span>
        <span class="game-card__meta">
          <span class="tag">${esc(game.genre)}</span>
          <span>${game.year}</span>
        </span>
      </span>
    </button>
    <div class="game-card__actions" data-card-actions></div>
  `;

  item.querySelector('[data-art]').prepend(createArt(game));
  item
    .querySelector('[data-card-actions]')
    .append(
      createActionButton('favorites', game),
      createActionButton('wishlist', game),
      createActionButton('library', game),
    );
  return item;
}
