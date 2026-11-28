import { debounce, qs, scrollToSection } from '../core/dom.js';
import {
  DEFAULT_FILTERS,
  SORTS,
  applyFilters,
  describeActiveFilters,
  isDefault,
} from '../core/filters.js';
import { games } from '../data/games.js';
import { createGameCard } from './card.js';
import { initFiltersPanel } from './filters-panel.js';
import { icon } from './icons.js';

/** Trending grid: title search, sorting, and the Filters panel (genre, platform, rating, year). */
export function initDiscover() {
  const section = qs('#discover');
  const searchInput = qs('[data-filter-search]', section);
  const sortSelect = qs('[data-filter-sort]', section);
  const filtersButton = qs('[data-filters-open]', section);
  const filtersCount = qs('[data-filters-count]', section);
  const activeFilters = qs('[data-active-filters]', section);
  const activePills = qs('[data-active-pills]', section);
  const resetButton = qs('[data-filter-reset]', section);
  const grid = qs('[data-grid="discover"]', section);
  const empty = qs('[data-empty="discover"]', section);
  const counter = qs('[data-result-count]', section);

  let filters = { ...DEFAULT_FILTERS };

  /* ----- Static controls ----- */
  sortSelect.append(...SORTS.map(({ value, label }) => new Option(label, value)));

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

    renderIndicators();
  }

  /** Toolbar badge + removable pills for every active filter group. */
  function renderIndicators() {
    const active = describeActiveFilters(filters);

    filtersButton.classList.toggle('is-active', active.length > 0);
    filtersCount.hidden = active.length === 0;
    filtersCount.textContent = active.length;
    filtersButton.setAttribute(
      'aria-label',
      active.length ? `Filters, ${active.length} active` : 'Filters',
    );

    activePills.replaceChildren(
      ...active.map(({ id, name, value }) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'filter-pill';
        pill.dataset.clear = id;
        pill.setAttribute('aria-label', `Remove filter ${name}: ${value}`);
        pill.innerHTML = `<span>${name}: <strong></strong></span>${icon('close', 14)}`;
        pill.querySelector('strong').textContent = value;
        return pill;
      }),
    );
    activeFilters.hidden = isDefault(filters); // "Clear filters" shows for any non-default state
  }

  /** Update filters, mirror them into the toolbar controls, and re-render. */
  function setFilters(next, options) {
    filters = { ...filters, ...next };
    searchInput.value = filters.query;
    sortSelect.value = filters.sort;
    render(options);
  }

  /* ----- Filters panel ----- */
  initFiltersPanel({
    getFilters: () => filters,
    // Live count in the panel: the draft combined with the current search.
    preview: (draft) => applyFilters(games, { ...filters, ...draft }).length,
    apply: (draft) => setFilters(draft),
  });

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

  activePills.addEventListener('click', (event) => {
    const pill = event.target.closest('[data-clear]');
    if (!pill) return;
    const entry = describeActiveFilters(filters).find(({ id }) => id === pill.dataset.clear);
    if (!entry) return;
    setFilters(entry.patch);
    filtersButton.focus(); // the pill is gone; keep keyboard focus nearby
  });

  const reset = () => setFilters({ ...DEFAULT_FILTERS });
  resetButton.addEventListener('click', reset);
  qs('[data-empty-reset]', section).addEventListener('click', reset);

  render();

  return {
    /**
     * Apply a fresh search from elsewhere on the page (e.g. the hero) and jump to results.
     * Other filters are cleared so a lingering filter can't hide the results; sort is kept.
     */
    show(next) {
      setFilters({ ...DEFAULT_FILTERS, sort: filters.sort, ...next });
      scrollToSection('discover');
    },
  };
}
