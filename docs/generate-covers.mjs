/**
 * Generates original SVG cover art for every game in js/data/games.js.
 *
 * Usage (from the project root):  node docs/generate-covers.mjs
 *
 * The covers are committed to assets/img/covers/, so running this is only
 * needed after you add a game or change a palette/motif.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { games } = await import(pathToFileURL(join(root, 'js/data/games.js')).href);
const outDir = join(root, 'assets/img/covers');

const esc = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(title, max = 13) {
  const lines = [];
  let line = '';
  for (const word of title.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const motifs = {
  rings: (c) =>
    [70, 125, 180, 235, 290]
      .map((r, i) => `<circle cx="300" cy="330" r="${r}" fill="none" stroke="${c}" stroke-width="3" opacity="${0.7 - i * 0.12}"/>`)
      .join('') + `<circle cx="300" cy="330" r="34" fill="${c}" opacity=".9"/>`,

  diamonds: (c) =>
    [36, 84, 132, 180, 228]
      .map((s, i) => `<rect x="${300 - s}" y="${330 - s}" width="${2 * s}" height="${2 * s}" transform="rotate(45 300 330)" fill="none" stroke="${c}" stroke-width="3" opacity="${0.8 - i * 0.12}"/>`)
      .join('') + `<rect x="276" y="306" width="48" height="48" transform="rotate(45 300 330)" fill="${c}" opacity=".9"/>`,

  peaks: (c, dark) =>
    `<circle cx="400" cy="230" r="74" fill="${c}" opacity=".9"/>` +
    `<path d="M0 560 L110 380 L200 500 L320 300 L440 480 L520 400 L600 520 L600 900 L0 900Z" fill="${dark}" opacity=".55"/>` +
    `<path d="M0 640 L140 480 L250 600 L380 440 L500 590 L600 500 L600 900 L0 900Z" fill="${dark}" opacity=".85"/>`,

  rays: (c) =>
    Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      const x = (300 + Math.cos(a) * 560).toFixed(1);
      const y = (330 + Math.sin(a) * 560).toFixed(1);
      return `<line x1="300" y1="330" x2="${x}" y2="${y}" stroke="${c}" stroke-width="${i % 2 ? 4 : 9}" opacity=".2"/>`;
    }).join('') + `<circle cx="300" cy="330" r="58" fill="${c}" opacity=".9"/>`,

  stripes: (c) =>
    `<g transform="rotate(-20 300 450)">` +
    Array.from({ length: 10 }, (_, i) => `<rect x="${-220 + i * 92}" y="-140" width="38" height="1200" fill="${c}" opacity="${i % 2 ? 0.16 : 0.3}"/>`).join('') +
    `</g><circle cx="300" cy="330" r="110" fill="none" stroke="${c}" stroke-width="6" opacity=".9"/>`,

  orbs: (c) =>
    [[150, 210, 74, 0.28], [430, 160, 52, 0.4], [330, 360, 118, 0.22], [120, 470, 46, 0.4], [480, 460, 84, 0.3], [250, 120, 28, 0.55], [540, 300, 26, 0.5]]
      .map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`)
      .join(''),
};

function cover(game) {
  const [c1, c2, c3] = game.palette;
  const lines = wrap(game.title);
  const lineHeight = 60;
  const last = 806;
  const first = last - (lines.length - 1) * lineHeight;
  const text = lines
    .map((line, i) => `<text x="40" y="${first + i * lineHeight}" font-size="54" font-weight="800" fill="#fff" letter-spacing="-1.5">${esc(line)}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900" font-family="Sora, 'Segoe UI', Arial, sans-serif" role="img" aria-label="${esc(game.title)} cover art">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".37" r=".55"><stop offset="0" stop-color="${c3}" stop-opacity=".85"/><stop offset="1" stop-color="${c3}" stop-opacity="0"/></radialGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".42" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient>
</defs>
<rect width="600" height="900" fill="url(#bg)"/>
<rect width="600" height="900" fill="url(#glow)"/>
${motifs[game.motif](c3, c1)}
<rect width="600" height="900" fill="url(#shade)"/>
<rect x="40" y="${first - 112}" width="44" height="4" rx="2" fill="${c3}"/>
<text x="40" y="${first - 66}" font-size="19" font-weight="700" fill="${c3}" letter-spacing="4">${esc(game.genre.toUpperCase())}</text>
${text}
<text x="40" y="862" font-size="20" font-weight="600" fill="#fff" opacity=".7" letter-spacing="2">${game.year}</text>
<rect x="1.5" y="1.5" width="597" height="897" rx="0" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"/>
</svg>
`;
}

await mkdir(outDir, { recursive: true });
for (const game of games) {
  await writeFile(join(outDir, `${game.id}.svg`), cover(game));
}
console.log(`Generated ${games.length} covers in ${outDir}`);
