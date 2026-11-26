import { debounce, qs, scrollToSection } from '../core/dom.js';
import { ALL_GENRES, DEFAULT_FILTERS, SORTS, applyFilters, isDefault } from '../core/filters.js';
import { games, genres } from '../data/games.js';
import { createGameCard } from './card.js';

/** Trending grid with title search, genre chips and sorting. */
export function initDiscover() {
  const section = qs('#discover');
  const searchInput = qs('[data-filter-search]', section);
  const sortSelect = qs('[data-filter-sort]', section);
  const chipRow = qs('[data-genre-chips]', section);
  const resetButton = qs('[data-filter-reset]', section);
  const grid = qs('[data-grid="discover"]', section);
  const empty = qs('[data-empty="discover"]', section);
  const counter = qs('[data-result-count]', section);

  let filters = { ...DEFAULT_FILTERS };

  /* ----- Static controls ----- */
  sortSelect.append(...SORTS.map(({ value, label }) => new Option(label, value)));

  [ALL_GENRES, ...genres].forEach((genre) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.genre = genre;
    chip.textContent = genre;
    chipRow.append(chip);
  });

  /* ----- Rendering ----- */
  function render({ animate = true } = {}) {
    const results = applyFilters(games, filters);

    grid.classList.toggle('is-animated', animate);
    grid.replaceChildren(...results.map((game, index) => createGameCard(game, index)));
    grid.hidden = results.length === 0;
    empty.hidden = results.length > 0;

    counter.textContent =
      results.length === games.length
        ? `${games.length} games`
        : `${results.length} of ${games.length} games`;

    chipRow.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.genre === filters.genre));
    });
    resetButton.hidden = isDefault(filters);
  }

  /** Update filters, mirror them into the form controls, and re-render. */
  function setFilters(next, options) {
    filters = { ...filters, ...next };
    searchInput.value = filters.query;
    sortSelect.value = filters.sort;
    render(options);
  }

  /* ----- Events ----- */
  searchInput.addEventListener(
    'input',
    debounce(() => {
      filters = { ...filters, query: searchInput.value };
      render({ animate: false }); // no re-animation while typing
    }, 120),
  );
  qs('[data-toolbar]', section).addEventListener('submit', (event) => event.preventDefault());
  sortSelect.addEventListener('change', () => setFilters({ sort: sortSelect.value }));
  chipRow.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-genre]');
    if (chip) setFilters({ genre: chip.dataset.genre });
  });

  const reset = () => setFilters({ ...DEFAULT_FILTERS });
  resetButton.addEventListener('click', reset);
  qs('[data-empty-reset]', section).addEventListener('click', reset);

  render();

  return {
    /** Apply filters from elsewhere on the page (e.g. the hero) and jump to results. */
    show(next) {
      setFilters(next);
      scrollToSection('discover');
    },
  };
}
