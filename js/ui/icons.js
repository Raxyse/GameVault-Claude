/** Inline SVG icon set (no icon-font or network dependency). */
const PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart:
    '<path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.6 3.6 4.5 6.9 4.5c2 0 3.4 1 5.1 3 1.7-2 3.1-3 5.1-3 3.3 0 5.4 3.1 4.2 6.6-1.8 4.8-9.3 9.4-9.3 9.4Z"/>',
  bookmark: '<path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z"/>',
  library:
    '<rect x="3.5" y="4" width="4" height="16" rx="1"/><rect x="9.5" y="4" width="4" height="16" rx="1"/><path d="m15.8 6.2 3.5-1 3 14.2-3.5 1Z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
};

const FILLED = new Set(['star']);

export function icon(name, size = 20) {
  const cls = FILLED.has(name) ? 'icon icon--fill' : 'icon';
  return `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${PATHS[name] ?? ''}</svg>`;
}

/** Fill every `[data-icon]` placeholder inside `root`. */
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, Number(el.dataset.iconSize) || 20);
  });
}
