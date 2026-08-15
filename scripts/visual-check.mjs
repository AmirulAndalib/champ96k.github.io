import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const OUT = '/tmp/shots';

const pages = [
  { path: '/', desktop: true },
  { path: '/', desktop: false },
  { path: '/projects', desktop: true },
  { path: '/projects', desktop: false },
  { path: '/projects/quantadb', desktop: true },
  { path: '/open-source', desktop: true },
  { path: '/writing', desktop: true },
  { path: '/writing/a-quiet-new-home', desktop: true },
  { path: '/values', desktop: true },
  { path: '/about', desktop: true },
  { path: '/about', desktop: false },
  { path: '/404', desktop: true },
];

const browser = await chromium.launch();
let failures = 0;

for (const { path, desktop } of pages) {
  const page = await browser.newPage({
    viewport: desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 },
  });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const status = response ? response.status() : 'no response';

  const name = `${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}${desktop ? '' : '-mobile'}`;
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });

  console.log(
    `${status === 200 ? 'OK  ' : 'FAIL'}  ${status}  ${path}  ${desktop ? 'desktop' : 'mobile'}  ${
      overflow ? 'H-OVERFLOW' : ''
    }  ${errors.length ? 'console:' + errors.join(' | ') : ''}`
  );
  if (status !== 200 || overflow || errors.length) failures++;
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} failures` : '\nAll checks passed');
process.exit(failures ? 1 : 0);