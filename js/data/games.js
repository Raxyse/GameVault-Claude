/**
 * Static game catalog (no external API).
 * `palette` = [dark, mid, glow] — used by the cover generator
 * (docs/generate-covers.mjs) and by the in-browser fallback artwork.
 * Ratings are on a 10-point scale and are illustrative for this demo.
 */
export const games = [
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    genre: 'Action RPG',
    year: 2022,
    rating: 9.6,
    developer: 'FromSoftware',
    description:
      'Journey across the Lands Between, a vast open world of ruined castles, hidden dungeons and towering foes. Build your own character, master demanding combat, and uncover a mythic story crafted with George R. R. Martin.',
    palette: ['#2a1a05', '#a8741a', '#ffd36b'],
    motif: 'rings',
  },
  {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    genre: 'RPG',
    year: 2023,
    rating: 9.7,
    developer: 'Larian Studios',
    description:
      'Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal and the lure of absolute power. Every choice reshapes the story in this deep, turn-based Dungeons & Dragons adventure.',
    palette: ['#1a0b3a', '#7a2bd1', '#ff9ad5'],
    motif: 'diamonds',
  },
  {
    id: 'zelda-tears-of-the-kingdom',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    genre: 'Adventure',
    year: 2023,
    rating: 9.6,
    developer: 'Nintendo EPD',
    description:
      'Soar above Hyrule and delve into the depths below as Link. Fuse materials, build inventive vehicles and bend physics to solve puzzles in a sky-to-underground playground that rewards curiosity.',
    palette: ['#06263a', '#1fa3a0', '#c9ff8a'],
    motif: 'peaks',
  },
  {
    id: 'hades',
    title: 'Hades',
    genre: 'Roguelike',
    year: 2020,
    rating: 9.3,
    developer: 'Supergiant Games',
    description:
      'Battle out of the Underworld as Zagreus, son of Hades. Fast, fluid combat, a gorgeous painted art style and a story that evolves with every escape attempt make each run feel fresh.',
    palette: ['#2b0508', '#d1252f', '#ffb347'],
    motif: 'rays',
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    genre: 'Action RPG',
    year: 2020,
    rating: 8.8,
    developer: 'CD Projekt Red',
    description:
      'Become V, a mercenary chasing a one-of-a-kind implant through the neon sprawl of Night City. Hack, shoot and talk your way through a dense open world of corporate intrigue and street-level stories.',
    palette: ['#12062a', '#c9bd10', '#ff2e93'],
    motif: 'stripes',
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    genre: 'Metroidvania',
    year: 2017,
    rating: 9.2,
    developer: 'Team Cherry',
    description:
      'Descend into Hallownest, a sprawling insect kingdom of forgotten caverns and haunting melodies. Precise combat, memorable bosses and a hand-drawn world make exploration endlessly rewarding.',
    palette: ['#050a18', '#2a4d8f', '#cfe3ff'],
    motif: 'orbs',
  },
  {
    id: 'celeste',
    title: 'Celeste',
    genre: 'Platformer',
    year: 2018,
    rating: 9.1,
    developer: 'Maddy Makes Games',
    description:
      'Help Madeline climb Celeste Mountain in a tight, heartfelt platformer about perseverance and anxiety. Razor-sharp controls and generous assist options make it welcoming to every kind of player.',
    palette: ['#1b1040', '#e0529c', '#7fe3ff'],
    motif: 'peaks',
  },
  {
    id: 'stardew-valley',
    title: 'Stardew Valley',
    genre: 'Simulation',
    year: 2016,
    rating: 9.2,
    developer: 'ConcernedApe',
    description:
      'Inherit your grandfather’s old farm and build a new life in Pelican Town. Grow crops, raise animals, explore caves and befriend the villagers at a pace that is entirely your own.',
    palette: ['#0f2a14', '#4fa83d', '#ffe27a'],
    motif: 'orbs',
  },
  {
    id: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    genre: 'Action',
    year: 2022,
    rating: 9.4,
    developer: 'Santa Monica Studio',
    description:
      'Kratos and Atreus travel across the Nine Realms as Fimbulwinter tightens its grip and Ragnarök looms. Weighty combat, cinematic set pieces and a moving father-and-son story drive this Norse epic.',
    palette: ['#06121f', '#3b7ea8', '#e8f6ff'],
    motif: 'rays',
  },
  {
    id: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    genre: 'Adventure',
    year: 2018,
    rating: 9.4,
    developer: 'Rockstar Games',
    description:
      'Ride with Arthur Morgan and the Van der Linde gang across a living, breathing American frontier in 1899. An astonishingly detailed world and an unforgettable cast anchor this outlaw saga.',
    palette: ['#2a0e06', '#c2562a', '#ffcf8a'],
    motif: 'peaks',
  },
  {
    id: 'portal-2',
    title: 'Portal 2',
    genre: 'Puzzle',
    year: 2011,
    rating: 9.5,
    developer: 'Valve',
    description:
      'Return to Aperture Science and think with portals again, now with gels, light bridges and a sharp-tongued cast. Brilliantly paced puzzles and razor-witty writing make this a timeless classic.',
    palette: ['#06142a', '#2487e8', '#ffa63d'],
    motif: 'rings',
  },
  {
    id: 'doom-eternal',
    title: 'DOOM Eternal',
    genre: 'Shooter',
    year: 2020,
    rating: 8.9,
    developer: 'id Software',
    description:
      'Rip and tear through the armies of Hell in a lightning-fast shooter that rewards aggression. Chain weapons, glory kills and movement into a relentless, heavy-metal ballet of destruction.',
    palette: ['#1c0303', '#d41f1f', '#ffb000'],
    motif: 'diamonds',
  },
].map((game) => ({ ...game, cover: `assets/img/covers/${game.id}.svg` }));

const byId = new Map(games.map((game) => [game.id, game]));

export const getGame = (id) => byId.get(id);

export const genres = [...new Set(games.map((game) => game.genre))].sort((a, b) =>
  a.localeCompare(b),
);
