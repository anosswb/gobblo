// the app has no Node types (it never runs in Node); only this test reads the disk
interface Fs {
  existsSync: (p: string) => boolean;
  readdirSync: (p: string) => string[];
  statSync: (p: string) => { isDirectory: () => boolean };
}
declare const __dirname: string;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { existsSync, readdirSync, statSync } = require('fs') as Fs;
const join = (a: string, b: string) => `${a}/${b}`;

/**
 * Metro tries the extensions in order (ts, tsx, …) and only then the platform: for `./update` on
 * Android it tries update.android.ts, update.ts, and only after that update.android.tsx. So a
 * plain `X.ts` next to `X.android.tsx` wins, and the Android file is never loaded.
 *
 * That is why the Android widgets never updated (Anass, 2026-11-12): the app loaded the empty
 * stand-in `widgets/update.ts` instead of `widgets/update.android.tsx`. Jest and tsc do not see
 * this, so this test looks at the file names.
 */
const EXTS = ['ts', 'tsx', 'mjs', 'js', 'jsx']; // Expo's Metro order
const PLATFORM = /\.(android|ios|native|web)\.(ts|tsx|js|jsx)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

test('no plain file hides a platform file from Metro', () => {
  const hidden: string[] = [];
  for (const file of walk(__dirname)) {
    const m = PLATFORM.exec(file);
    if (!m) continue;
    const base = file.slice(0, m.index);
    // every extension Metro tries before this file's own extension
    for (const ext of EXTS.slice(0, EXTS.indexOf(m[2]))) {
      if (existsSync(`${base}.${ext}`)) hidden.push(`${file} is hidden by ${base}.${ext}`);
    }
  }
  expect(hidden).toEqual([]);
});
