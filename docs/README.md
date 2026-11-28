# GameVault — Discover. Collect. Play.

A modern video game catalog built with plain HTML5, CSS3 and vanilla JavaScript (ES modules).
No frameworks, no build step, no npm dependencies. Personal collections are saved in `localStorage`.

## Run it

ES modules require HTTP (opening `index.html` via `file://` will not work). From the project root:

```bash
python3 -m http.server 8080      # or: npx serve .
```

Then open <http://localhost:8080>.

## Features

| Area | What it does |
| --- | --- |
| Navigation | Sticky header with Home / Discover / Library / Wishlist, live count badges, active-section highlight, mobile menu |
| Hero | Headline, search form, popular-genre shortcuts, featured artwork (opens details) |
| Trending | 12 game cards with cover, title, genre, year, rating and hover effects |
| Search & filter | Title search (accent-insensitive), sort by trending / rating / year / title, and one **Filters** button that opens a panel with genre, platform (All / PC / PlayStation / Xbox / Nintendo), rating min–max and release-year min–max; active-filter count badge, removable pills, Apply / Reset / Clear filters |
| Details | Native `<dialog>`: framed cover poster, genre + platform badges, rating score, release date/year, developer, publisher, description, Library / Wishlist / Favorites buttons, contextual "Back to …" button (Esc, ✕ and outside-click also close) |
| Collections | Favorites (heart), Library and Wishlist; persisted in `localStorage`, synced across tabs |
| Resilience | Image failure falls back to a generated title card; storage failure falls back to memory |

Accessibility: semantic landmarks, skip link, labelled controls, `aria-pressed` toggles, accessible
tabs (arrow keys / Home / End), focus-visible rings, focus trap + Esc in the dialog, reduced-motion support.

## Project structure

```
index.html                  Page markup (semantic, no inline JS/CSS)
css/
  base.css                  Design tokens, reset, typography, ambient background
  layout.css                Header/nav, hero, sections, grid, footer
  components.css            Buttons, forms, chips, cards, tabs, modal, filters drawer, toast
  responsive.css            Tablet/mobile rules + prefers-reduced-motion
js/
  main.js                   Entry point — wires modules together
  data/games.js             Static catalog (12 games) + genre list
  core/
    dom.js                  qs/qsa, HTML escape, debounce, scroll helper
    storage.js              Guarded localStorage read/write
    store.js                Favorites/library/wishlist state + subscribe()
    filters.js              Pure search / filter (genre, platform, rating, year) / sort logic + validation
  ui/
    icons.js                Inline SVG icon set
    art.js                  Cover image with graceful fallback
    actions.js              Toggle buttons (one factory, one delegated handler)
    card.js                 Game card component
    modal.js                Details dialog
    toast.js                Feedback toasts
    nav.js                  Header, mobile menu, active link
    hero.js                 Featured art, hero search, genre shortcuts
    discover.js             Trending grid, toolbar, active-filter badge and pills
    filters-panel.js        Filters drawer (draft → Apply), validation, live result count
    collections.js          Library / Favorites / Wishlist grids and tabs
assets/img/
  logo.svg, favicon.svg     Branding
  covers/*.svg              Original generated cover art (local = always reliable)
docs/
  README.md                 This file
  generate-covers.mjs       Regenerates covers from js/data/games.js
```

## Adding a game

1. Add an entry to `js/data/games.js` (`id`, `title`, `genre`, `year`, `rating`, `developer`,
   `releaseDate` (ISO, must match `year`), `publisher`, `platforms` (array), `description`,
   `palette`, `motif`).
2. Run `node docs/generate-covers.mjs` to create `assets/img/covers/<id>.svg`
   (or drop in your own image at that path).

New genres automatically appear in the Filters panel.

### Filters panel

`Filters` (toolbar) opens a drawer on desktop/tablet and a bottom sheet on mobile. Search and sort stay in the toolbar.

- **Draft → Apply:** the panel edits a draft; the grid changes only on **Apply Filters**. Closing (✕, Esc, outside click)
  discards unapplied edits, and reopening always shows the currently applied filters. **Reset** clears the draft;
  the toolbar's **Clear filters** (or a pill's ✕) clears applied filters immediately.
- **Live count:** the panel shows how many games match the draft (combined with the current search) before you apply.
- **Active filters:** the badge counts active groups (genre, platform, rating, year — search and sort aren't counted);
  each group also appears as a removable pill.
- **Platform** filters by *family* (`PLATFORM_FILTERS` in `js/core/filters.js`, e.g. PlayStation = `PS3`, `PS4`, `PS5`).
  A game matches when any of its `platforms` is in the family, so multi-platform games show under each family.
  macOS / Linux / Mobile appear in game details but have no filter option.
- **Rating / year ranges:** both bounds are optional (empty = no limit) and inclusive. Rating uses at most one decimal
  (0–10); years are whole numbers (1950–2100). Invalid ranges show an inline message and disable Apply.
- Hero search and genre shortcuts clear all filters first (sort is kept), so a lingering filter can't hide results.

## Notes

- Ratings, descriptions and publisher/platform details are illustrative demo catalog data; there is no external API yet.
- Cover art is original and generated locally; game titles belong to their respective owners.
- LocalStorage key: `gamevault:v1` → `{ favorites: [], library: [], wishlist: [] }` (game ids).
  Unknown ids and corrupt data are discarded on load.
- A natural next step is replacing `js/data/games.js` with an API client that returns the same shape.
