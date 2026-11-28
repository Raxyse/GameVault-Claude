/** Pure search / filter / sort logic for the catalog. */

export const ALL_GENRES = 'All';

export const SORTS = [
  { value: 'trending', label: 'Sort: Trending' },
  { value: 'rating', label: 'Rating: high to low' },
  { value: 'newest', label: 'Release year: newest' },
  { value: 'oldest', label: 'Release year: oldest' },
  { value: 'title', label: 'Title: A–Z' },
];

export const ALL_PLATFORMS = 'All';

/**
 * Platform filter options. Each option is a platform *family*: a game matches
 * when it ships on at least one of the listed catalog platforms, so
 * multi-platform games appear under every family they belong to.
 */
export const PLATFORM_FILTERS = [
  { value: ALL_PLATFORMS, label: 'All Platforms', match: [] },
  { value: 'pc', label: 'PC', match: ['PC'] },
  { value: 'playstation', label: 'PlayStation', match: ['PS3', 'PS4', 'PS5'] },
  { value: 'xbox', label: 'Xbox', match: ['Xbox 360', 'Xbox One', 'Xbox Series X|S'] },
  { value: 'nintendo', label: 'Nintendo', match: ['Switch'] },
];

export const platformLabel = (value) =>
  PLATFORM_FILTERS.find((option) => option.value === value)?.label ?? PLATFORM_FILTERS[0].label;

function supportsPlatform(game, value) {
  if (value === ALL_PLATFORMS) return true;
  const option = PLATFORM_FILTERS.find((item) => item.value === value);
  return !option || game.platforms.some((platform) => option.match.includes(platform));
}

/** Allowed input ranges for the rating (10-point scale) and release-year filters. */
export const RATING_BOUNDS = Object.freeze({ min: 0, max: 10 });
export const YEAR_BOUNDS = Object.freeze({ min: 1950, max: 2100 });

/**
 * Range filters use `null` for "no limit", so an untouched range never
 * excludes anything.
 */
export const DEFAULT_FILTERS = Object.freeze({
  query: '',
  genre: ALL_GENRES,
  platform: ALL_PLATFORMS,
  ratingMin: null,
  ratingMax: null,
  yearMin: null,
  yearMax: null,
  sort: 'trending',
});

/** Lowercase and strip accents so "ragnarok" matches "Ragnarök". */
const normalize = (text) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

const comparators = {
  trending: () => 0, // keep catalog order (Array.sort is stable)
  rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title),
  newest: (a, b) => b.year - a.year || b.rating - a.rating,
  oldest: (a, b) => a.year - b.year || b.rating - a.rating,
  title: (a, b) => a.title.localeCompare(b.title),
};

const inRange = (value, min, max) => (min == null || value >= min) && (max == null || value <= max);

export function applyFilters(
  games,
  {
    query,
    genre,
    platform = ALL_PLATFORMS,
    ratingMin = null,
    ratingMax = null,
    yearMin = null,
    yearMax = null,
    sort,
  },
) {
  const needle = normalize(query);
  return games
    .filter((game) => genre === ALL_GENRES || game.genre === genre)
    .filter((game) => supportsPlatform(game, platform))
    .filter((game) => inRange(game.rating, ratingMin, ratingMax))
    .filter((game) => inRange(game.year, yearMin, yearMax))
    .filter((game) => !needle || normalize(game.title).includes(needle))
    .sort(comparators[sort] ?? comparators.trending);
}

export const isDefault = (filters) =>
  Object.keys(DEFAULT_FILTERS).every((key) => filters[key] === DEFAULT_FILTERS[key]);

/* ---------- Panel helpers ---------- */

/** Observed rating / year extremes of the catalog (used as input hints). */
export function catalogBounds(games) {
  const ratings = games.map((game) => game.rating);
  const years = games.map((game) => game.year);
  return {
    rating: [Math.min(...ratings), Math.max(...ratings)],
    year: [Math.min(...years), Math.max(...years)],
  };
}

const isTenth = (value) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;

/**
 * Validate the rating / year ranges of a draft. Returns `{ rating?, year? }`
 * with a human-readable message per invalid group (empty object = valid).
 */
export function validateRanges({ ratingMin = null, ratingMax = null, yearMin = null, yearMax = null } = {}) {
  const errors = {};

  const ratings = [ratingMin, ratingMax].filter((value) => value != null);
  if (ratings.some((value) => value < RATING_BOUNDS.min || value > RATING_BOUNDS.max)) {
    errors.rating = `Enter a rating between ${RATING_BOUNDS.min} and ${RATING_BOUNDS.max}.`;
  } else if (!ratings.every(isTenth)) {
    errors.rating = 'Use at most one decimal place, for example 9.5.';
  } else if (ratingMin != null && ratingMax != null && ratingMin > ratingMax) {
    errors.rating = 'Minimum rating can’t be higher than the maximum.';
  }

  const years = [yearMin, yearMax].filter((value) => value != null);
  if (!years.every(Number.isInteger)) {
    errors.year = 'Enter whole years only, for example 2018.';
  } else if (years.some((value) => value < YEAR_BOUNDS.min || value > YEAR_BOUNDS.max)) {
    errors.year = `Enter a year between ${YEAR_BOUNDS.min} and ${YEAR_BOUNDS.max}.`;
  } else if (yearMin != null && yearMax != null && yearMin > yearMax) {
    errors.year = 'Minimum year can’t be later than the maximum.';
  }

  return errors;
}

function formatRange(min, max, format) {
  if (min != null && max != null) return `${format(min)}–${format(max)}`;
  if (min != null) return `${format(min)}+`;
  return `Up to ${format(max)}`;
}

/**
 * The active filter *groups* (genre, platform, rating, year) — search and sort
 * are not counted. Each entry carries the `patch` that clears it, so the UI
 * can render removable pills and the toolbar badge from one source.
 */
export function describeActiveFilters(filters) {
  const active = [];
  if (filters.genre !== ALL_GENRES) {
    active.push({ id: 'genre', name: 'Genre', value: filters.genre, patch: { genre: ALL_GENRES } });
  }
  if (filters.platform !== ALL_PLATFORMS) {
    active.push({
      id: 'platform',
      name: 'Platform',
      value: platformLabel(filters.platform),
      patch: { platform: ALL_PLATFORMS },
    });
  }
  if (filters.ratingMin != null || filters.ratingMax != null) {
    active.push({
      id: 'rating',
      name: 'Rating',
      value: formatRange(filters.ratingMin, filters.ratingMax, (value) => value.toFixed(1)),
      patch: { ratingMin: null, ratingMax: null },
    });
  }
  if (filters.yearMin != null || filters.yearMax != null) {
    active.push({
      id: 'year',
      name: 'Year',
      value: formatRange(filters.yearMin, filters.yearMax, String),
      patch: { yearMin: null, yearMax: null },
    });
  }
  return active;
}

export const activeFilterCount = (filters) => describeActiveFilters(filters).length;
