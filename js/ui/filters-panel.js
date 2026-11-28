import { qs } from '../core/dom.js';
import {
  ALL_GENRES,
  ALL_PLATFORMS,
  DEFAULT_FILTERS,
  PLATFORM_FILTERS,
  catalogBounds,
  validateRanges,
} from '../core/filters.js';
import { games, genres } from '../data/games.js';

const RANGE_FIELDS = ['ratingMin', 'ratingMax', 'yearMin', 'yearMax'];

const toNumber = (value) => {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

/**
 * Filters drawer. It edits a *draft*: nothing changes in the grid until
 * "Apply Filters". Closing without applying discards the draft, and reopening
 * always starts from the filters that are currently applied.
 *
 * @param {{
 *   getFilters: () => object,
 *   preview: (draft: object) => number,
 *   apply: (draft: object) => void,
 * }} options
 */
export function initFiltersPanel({ getFilters, preview, apply }) {
  const dialog = qs('#filters-panel');
  const form = qs('#filters-form');
  const applyButton = qs('[data-filters-apply]', form);
  const previewText = qs('[data-filters-preview]', form);

  /* ----- Options (radio groups styled as chips) ----- */
  function fillChoices(host, name, options) {
    host.replaceChildren(
      ...options.map(({ value, label }) => {
        const choice = document.createElement('label');
        choice.className = 'choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = value;
        const text = document.createElement('span');
        text.className = 'chip';
        text.textContent = label;
        choice.append(input, text);
        return choice;
      }),
    );
  }

  fillChoices(qs('[data-genre-options]', form), 'genre', [
    { value: ALL_GENRES, label: 'All genres' },
    ...genres.map((genre) => ({ value: genre, label: genre })),
  ]);
  fillChoices(
    qs('[data-platform-options]', form),
    'platform',
    PLATFORM_FILTERS.map(({ value, label }) => ({ value, label })),
  );

  /* ----- Hints from the catalog ----- */
  const bounds = catalogBounds(games);
  form.elements.ratingMin.placeholder = bounds.rating[0].toFixed(1);
  form.elements.ratingMax.placeholder = bounds.rating[1].toFixed(1);
  form.elements.yearMin.placeholder = String(bounds.year[0]);
  form.elements.yearMax.placeholder = String(bounds.year[1]);
  qs('[data-hint="rating"]', form).textContent =
    `Catalog: ${bounds.rating[0].toFixed(1)} – ${bounds.rating[1].toFixed(1)} on a 0–10 scale. Leave empty for no limit.`;
  qs('[data-hint="year"]', form).textContent =
    `Catalog: ${bounds.year[0]} – ${bounds.year[1]}. Leave empty for no limit.`;

  /* ----- Draft <-> form ----- */
  function readDraft() {
    const data = new FormData(form);
    return {
      genre: data.get('genre') ?? ALL_GENRES,
      platform: data.get('platform') ?? ALL_PLATFORMS,
      ratingMin: toNumber(data.get('ratingMin')),
      ratingMax: toNumber(data.get('ratingMax')),
      yearMin: toNumber(data.get('yearMin')),
      yearMax: toNumber(data.get('yearMax')),
    };
  }

  function writeDraft(values) {
    form.elements.genre.value = values.genre;
    form.elements.platform.value = values.platform;
    RANGE_FIELDS.forEach((name) => {
      form.elements[name].value = values[name] ?? '';
    });
  }

  /** Validate, show inline errors, update the live result count. */
  function refresh() {
    const draft = readDraft();
    const errors = validateRanges(draft);

    ['rating', 'year'].forEach((group) => {
      const message = errors[group];
      const error = qs(`[data-error="${group}"]`, form);
      error.hidden = !message;
      error.textContent = message ?? '';
      [`${group}Min`, `${group}Max`].forEach((name) => {
        form.elements[name].setAttribute('aria-invalid', String(Boolean(message)));
      });
    });

    const invalid = Object.keys(errors).length > 0;
    applyButton.disabled = invalid;
    if (invalid) {
      previewText.textContent = 'Fix the highlighted range to continue.';
    } else {
      const total = preview(draft);
      previewText.textContent =
        total === 0
          ? 'No games match these filters'
          : `${total} ${total === 1 ? 'game matches' : 'games match'}`;
    }
    return { draft, invalid };
  }

  /* ----- Open / close ----- */
  function open() {
    writeDraft(getFilters());
    refresh();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.documentElement.classList.add('is-locked');
    qs('.drawer__body', dialog).scrollTop = 0;
  }

  const close = () => {
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('is-locked');
  });
  // Clicking the backdrop targets the <dialog> itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  qs('[data-filters-close]', dialog).addEventListener('click', close);
  qs('[data-filters-open]').addEventListener('click', open);

  /* ----- Form events ----- */
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  qs('[data-filters-reset]', form).addEventListener('click', () => {
    writeDraft(DEFAULT_FILTERS); // clears the draft only; "Apply Filters" commits it
    refresh();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { draft, invalid } = refresh();
    if (invalid) return;
    apply(draft);
    close();
  });

  return { open, close };
}
