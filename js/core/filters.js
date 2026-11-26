/** Pure search / filter / sort logic for the catalog. */

export const ALL_GENRES = 'All';

export const SORTS = [
  { value: 'trending', label: 'Sort: Trending' },
  { value: 'rating', label: 'Rating: high to low' },
  { value: 'newest', label: 'Release year: newest' },
  { value: 'oldest', label: 'Release year: oldest' },
  { value: 'title', label: 'Title: A–Z' },
];

export const DEFAULT_FILTERS = Object.freeze({ query: '', genre: ALL_GENRES, sort: 'trending' });

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

export function applyFilters(games, { query, genre, sort }) {
  const needle = normalize(query);
  return games
    .filter((game) => genre === ALL_GENRES || game.genre === genre)
    .filter((game) => !needle || normalize(game.title).includes(needle))
    .sort(comparators[sort] ?? comparators.trending);
}

export const isDefault = (filters) =>
  Object.keys(DEFAULT_FILTERS).every((key) => filters[key] === DEFAULT_FILTERS[key]);
