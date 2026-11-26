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
| Search & filter | Title search (accent-insensitive), genre chips, sort by trending / rating / year / title |
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
  components.css            Buttons, forms, chips, cards, tabs, modal, toast
  responsive.css            Tablet/mobile rules + prefers-reduced-motion
js/
  main.js                   Entry point — wires modules together
  data/games.js             Static catalog (12 games) + genre list
  core/
    dom.js                  qs/qsa, HTML escape, debounce, scroll helper
    storage.js              Guarded localStorage read/write
    store.js                Favorites/library/wishlist state + subscribe()
    filters.js              Pure search / genre / sort logic
  ui/
    icons.js                Inline SVG icon set
    art.js                  Cover image with graceful fallback
    actions.js              Toggle buttons (one factory, one delegated handler)
    card.js                 Game card component
    modal.js                Details dialog
    toast.js                Feedback toasts
    nav.js                  Header, mobile menu, active link
    hero.js                 Featured art, hero search, genre shortcuts
    discover.js             Trending grid + toolbar
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

New genres automatically appear as filter chips.

## Notes

- Ratings, descriptions and publisher/platform details are illustrative demo catalog data; there is no external API yet.
- Cover art is original and generated locally; game titles belong to their respective owners.
- LocalStorage key: `gamevault:v1` → `{ favorites: [], library: [], wishlist: [] }` (game ids).
  Unknown ids and corrupt data are discarded on load.
- A natural next step is replacing `js/data/games.js` with an API client that returns the same shape.
