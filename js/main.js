/**
 * GameVault entry point — wires the modules together.
 *   core/  state, storage, filtering (no DOM knowledge beyond helpers)
 *   data/  static catalog
 *   ui/    components that render and handle interaction
 */
import { ALL_GENRES, ALL_PLATFORMS } from './core/filters.js';
import { initActions } from './ui/actions.js';
import { initCollections } from './ui/collections.js';
import { initDiscover } from './ui/discover.js';
import { initHero } from './ui/hero.js';
import { hydrateIcons } from './ui/icons.js';
import { initModal } from './ui/modal.js';
import { initNav } from './ui/nav.js';

hydrateIcons();
initNav();
initActions();
initModal();

const discover = initDiscover();
initCollections();

initHero({
  onSearch: (query) => discover.show({ query, genre: ALL_GENRES, platform: ALL_PLATFORMS }),
  onGenre: (genre) => discover.show({ query: '', genre, platform: ALL_PLATFORMS }),
});
