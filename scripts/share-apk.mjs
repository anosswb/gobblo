// Serves build-output/*.apk on the home Wi-Fi so a phone can download the test build.
// Run: node scripts/share-apk.mjs   → open http://<mac-ip>:8770 on the phone.
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

const dir = join(process.cwd(), 'build-output');
const port = Number(process.env.PORT ?? 8770);

createServer((req, res) => {
  const name = decodeURIComponent((req.url ?? '/').split('?')[0].slice(1));
  const files = readdirSync(dir).filter((f) => f.endsWith('.apk'));
  if (!name) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<meta name="viewport" content="width=device-width"><h2>Gobblo test build</h2>${files.map((f) => `<p><a style="font-size:22px" href="/${f}">download ${f}</a></p>`).join('')}`);
    return;
  }
  if (!files.includes(name)) {
    res.writeHead(404).end('not found');
    return;
  }
  const path = join(dir, name);
  res.writeHead(200, {
    'content-type': 'application/vnd.android.package-archive',
    'content-length': statSync(path).size,
    'content-disposition': `attachment; filename="${name}"`,
  });
  createReadStream(path).pipe(res);
}).listen(port, '0.0.0.0', () => console.log(`sharing ${dir} on port ${port}`));
