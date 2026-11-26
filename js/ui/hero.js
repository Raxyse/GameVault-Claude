import { esc, qs } from '../core/dom.js';
import { genres, getGame } from '../data/games.js';
import { createArt } from './art.js';

const FEATURED = { left: 'hades', center: 'baldurs-gate-3', right: 'zelda-tears-of-the-kingdom' };
const POPULAR_GENRES = ['RPG', 'Action RPG', 'Adventure', 'Roguelike', 'Platformer'];

/**
 * Hero: featured artwork, search form and quick genre shortcuts.
 * @param {{onSearch: (query: string) => void, onGenre: (genre: string) => void}} handlers
 */
export function initHero({ onSearch, onGenre }) {
  /* ----- Featured artwork ----- */
  const visual = qs('[data-hero-art]');
  Object.entries(FEATURED).forEach(([position, id]) => {
    const game = getGame(id);
    if (!game) return;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'hero-card';
    card.dataset.pos = position;
    card.dataset.openId = game.id;
    card.setAttribute('aria-label', `View details: ${game.title}`);
    card.append(createArt(game, { eager: true }));
    visual.append(card);
  });

  const lead = getGame(FEATURED.center);
  if (lead) {
    visual.insertAdjacentHTML(
      'beforeend',
      `<div class="hero__caption">
         <span class="hero__caption-label">Featured</span>
         <strong>${esc(lead.title)}</strong>
         <span class="hero__caption-meta">${esc(lead.genre)} · ${lead.year} · ★ ${lead.rating.toFixed(1)}</span>
       </div>`,
    );
  }

  /* ----- Search ----- */
  const form = qs('[data-hero-search]');
  const input = qs('input', form);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSearch(input.value.trim());
  });

  /* ----- Genre shortcuts ----- */
  const shortcuts = qs('[data-hero-genres]');
  shortcuts.insertAdjacentHTML('beforeend', '<span class="hero__genres-label">Popular:</span>');
  POPULAR_GENRES.filter((genre) => genres.includes(genre)).forEach((genre) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = genre;
    chip.addEventListener('click', () => onGenre(genre));
    shortcuts.append(chip);
  });
}
