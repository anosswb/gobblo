// Draws the Android widget-picker previews (assets/widgets/*.png) from the same SVG art the
// widgets use (src/widgets/svg-art.ts). macOS only: renders with `sips`.
// Run: node scripts/gen-widget-previews.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ts = (p) => stripTypeScriptTypes(readFileSync(p, 'utf8')).replace(/^import .*;$/gm, '');
const { petSvg, iconSvg, mix: mixHex } = await import(`data:text/javascript,${encodeURIComponent(ts('src/widgets/icon-paths.ts') + ts('src/widgets/svg-art.ts'))}`);

const PINK = '#C98B5E'; // the otter's caramel (name kept from the old pink pet)
const BG = '#FBEEDD';
const TINT = mixHex(PINK, '#FFFFFF', 0.84);
const TINT_INK = mixHex(PINK, '#000000', 0.25);
const INK = '#003459'; // buttons
const TEXT = '#00171F';
const INK2 = '#5E6F78';
const CHIP = '#F1DFC8';
const font = `font-family="Helvetica Neue, Helvetica, Arial, sans-serif"`;
const embed = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `).replace(/ width="(48|200)" height="(48|240)"/, '');

const button = (x, y, w, label) => `<rect x="${x}" y="${y}" width="${w}" height="80" rx="40" fill="${INK}"/>${embed(iconSvg('play', BG, 2.4, true), x + w / 2 - 74, y + 26, 28, 28)}<text x="${x + w / 2 + 16}" y="${y + 50}" ${font} font-size="26" font-weight="700" fill="${BG}" text-anchor="middle">${label}</text>`;
const round = (x, y, icon) => `<circle cx="${x + 40}" cy="${y + 40}" r="40" fill="${CHIP}"/>${embed(iconSvg(icon, TEXT, 2.4), x + 24, y + 24, 32, 32)}`;

const previews = {
  'pet-small': [160, 160, `<rect width="160" height="160" rx="52" fill="${TINT}"/>${embed(petSvg(PINK, 'hungry'), 34, 24, 92, 110)}<rect x="110" y="12" width="38" height="38" rx="19" fill="${INK}"/><text x="129" y="38" ${font} font-size="22" font-weight="800" fill="#fff" text-anchor="middle">3</text>`],
  'next-bite-square': [320, 320, `<rect width="320" height="320" rx="52" fill="${BG}"/><rect x="26" y="26" width="76" height="76" rx="26" fill="${TINT}"/>${embed(iconSvg('message', TINT_INK, 2.2), 46, 46, 36, 36)}${embed(petSvg(PINK, 'hungry'), 236, 22, 58, 70)}
<text x="28" y="160" ${font} font-size="22" font-weight="600" fill="${INK2}">Next bite · 1 of 3</text><text x="28" y="198" ${font} font-size="32" font-weight="800" fill="${TEXT}">Text mom back</text>${button(26, 216, 178, 'Start 2 min')}${round(214, 216, 'skip')}`],
  'next-bite': [640, 320, `<rect width="640" height="320" rx="52" fill="${BG}"/><rect x="22" y="22" width="200" height="276" rx="38" fill="${TINT}"/>${embed(petSvg(PINK, 'hungry'), 60, 48, 124, 148)}<text x="122" y="250" ${font} font-size="24" font-weight="700" fill="${TINT_INK}" text-anchor="middle">Noodle</text>
${embed(iconSvg('message', INK2, 2.2), 250, 34, 26, 26)}<text x="286" y="56" ${font} font-size="23" font-weight="600" fill="${INK2}">Next bite · 1 of 3</text><text x="250" y="104" ${font} font-size="36" font-weight="800" fill="${TEXT}">Text mom back</text>${button(250, 216, 194, 'Start 2 min')}${round(458, 216, 'skip')}${round(548, 216, 'plus')}`],
};

mkdirSync('assets/widgets', { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'widget-previews-'));
for (const [name, [w, h, body]] of Object.entries(previews)) {
  const src = join(tmp, `${name}.svg`);
  writeFileSync(src, `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
  execFileSync('sips', ['-s', 'format', 'png', src, '--out', `assets/widgets/${name}.png`], { stdio: 'ignore' });
  console.log(`assets/widgets/${name}.png`);
}
