import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const failures = [];

async function assert(cond, label) {
  if (cond) console.log(`PASS  ${label}`);
  else {
    failures.push(label);
    console.log(`FAIL  ${label}`);
  }
}

const browser = await chromium.launch();

async function grab(path) {
  const page = await browser.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  return page;
}

// ---------- Home ----------
{
  const page = await grab('/');
  const h1 = await page.locator('h1').first().innerText();
  assert(h1 === 'Tushar Nikam', 'Home h1 = "Tushar Nikam"');
  assert((await page.locator('header .wordmark').count()) === 0, 'Header has no wordmark (name lives on home)');
  const body = await page.locator('body').innerText();
  const lower = body.toLowerCase();
  assert(lower.includes('software engineer, builder and tinkerer'), 'Home headline present');
  assert(!lower.includes('currently working as'), 'Home has no "Currently working as" line');
  assert(lower.includes('gojek'), 'Home tagline mentions Gojek');
  const taglineParas = await page.locator('.home-hero-text .lede').count();
  assert(taglineParas >= 2, `Home tagline split into paragraphs (${taglineParas})`);
  assert(!lower.includes('selected work'), 'Home has no "Selected work" section');
  const avatarCount = await page.locator('img.home-avatar').count();
  assert(avatarCount === 1, `Home avatar present (${avatarCount})`);
  assert(lower.includes('find me'), 'Home has "Find me" section');
  const socialItems = await page.locator('.findme-icons a').count();
  assert(socialItems >= 5, `Home shows ${socialItems} social icon links`);
  const letThink = await page.locator("a[href*='letmethink']").allInnerTexts();
  assert(letThink.length >= 1, 'Home links to letmethink.champ96k.com');
  assert(lower.includes('recent writing'), 'Home recent writing heading');
  const writingLinks = await page.locator("a[href*='/writing/']").allInnerTexts();
  assert(writingLinks.some((t) => t.includes('A quiet new home')), 'Home links to seed post');
  const seeAll = await page.locator("a.btn-link[href='/writing']").innerText();
  assert(seeAll.trim().toLowerCase() === 'see all writing →', `Home "See all writing" button (${seeAll.trim()})`);
  assert(!lower.includes('there is no greater good'), 'Home has no Values preview');
  const title = await page.title();
  assert(title.startsWith('Tushar Nikam'), `Home <title>: "${title}"`);
  await page.close();
}

// ---------- Projects ----------
{
  const page = await grab('/projects');
  const title = await page.locator('h1').first().innerText();
  assert(title === 'Projects', 'Projects h1');
  const listTitles = await page
    .locator('.project-entry .entry-title a')
    .allInnerTexts();
  assert(listTitles.length === 12, `Projects list has 12 rows (${listTitles.length})`);
  const first = listTitles[0] ?? '';
  assert(first.trim() === 'Project 1947', `Newest first — first row "${first}"`);
  const body = await page.locator('body').innerText();
  const lower = body.toLowerCase();
  assert(lower.includes('august 2026'), 'Grouped by month — August 2026 present');
  assert(lower.includes('january 2026'), 'Grouped by month — January 2026 present');
  assert(/\b2026\b/.test(body) && /\b2025\b/.test(body), 'Year groups 2026 & 2025 present');
  assert(lower.includes('let me think'), 'Projects includes Let Me Think');
  assert(lower.includes('UI Color Picker'.toLowerCase()), 'Projects includes UI Color Picker');
  assert(!lower.includes('story weave'), 'Projects has no Story Weave');
  assert(!lower.includes('bytehire'), 'Projects has no ByteHire AI');
  assert(!lower.includes('instagram reels'), 'Projects has no Instagram Reels');
  assert(!lower.includes('PermissionKit'.toLowerCase()), 'Projects has no PermissionKit');
  const linkRows = await page.locator('.project-links').count();
  assert(linkRows >= 12, `Every project row has links (${linkRows} rows)`);
  const tagSpans = await page.locator('.project-entry .tags .tag').count();
  assert(tagSpans > 0, `Project tags render with spacing container (${tagSpans} tags)`);
  const thumbs = await page.locator('.project-entry .entry-thumb').count();
  assert(thumbs === 12, `Every project row has a thumbnail (${thumbs})`);
  const storeLinks = await page.locator(".project-links a").allInnerTexts();
  assert(storeLinks.some((t) => t.includes('App Store')), 'Project list shows App Store link');
  assert(storeLinks.some((t) => t.includes('Play Store')), 'Project list shows Play Store link');
  await page.close();
}

// ---------- Project detail ----------
{
  const page = await grab('/projects/quantadb');
  const h1 = await page.locator('h1').first().innerText();
  assert(h1 === 'QuantaDB', 'Project detail h1 = QuantaDB');
  const body = await page.locator('body').innerText();
  assert(body.includes('High-performance NoSQL local database'), 'Project description shown');
  assert(body.includes('GitHub') || body.includes('Visit website'), 'Project links shown');
  const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
  assert(canonical === 'https://champ96k.com/projects/quantadb', `Canonical correct (${canonical})`);
  await page.close();
}

// ---------- Open source ----------
{
  const page = await grab('/open-source');
  const body = await page.locator('body').innerText();
  const lower = body.toLowerCase();
  assert(lower.includes('open source projects'), 'OS "Open source projects" heading');
  const projectTitles = await page.locator('.os-project .entry-title a').allInnerTexts();
  assert(projectTitles.length === 23, `OS project list rows = 23 (${projectTitles.length})`);
  assert(projectTitles.some((t) => t.includes('QuantaDB')), 'OS list includes QuantaDB');
  assert(projectTitles.some((t) => t.includes('Tokenbar')), 'OS list includes Tokenbar');
  assert(projectTitles.some((t) => t.includes('Dashed Rect')), 'OS list includes Dashed Rect');
  const thumbs = await page.locator('.os-project .entry-thumb').count();
  assert(thumbs === 23, `OS projects have image placeholders (${thumbs})`);
  const osHrefs = await page.locator('.os-project .project-links a').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  assert(
    osHrefs.some((h) => /pub\.dev|netlify|web\.app|vercel|labs\.champ96k|gopay|#\//.test(h)),
    'OS rows show live links where available'
  );
  assert(lower.includes('contributions'), 'Open source "Contributions" heading');
  assert(body.includes('firebase/flutterfire'), 'OS contributions includes flutterfire PR');
  assert(body.includes('WorldHealthOrganization/app'), 'OS contributions includes WHO');
  const badges = await page.locator('.state-badge').allInnerTexts();
  assert(badges.length >= 5, `OS contribution states shown (${badges.length})`);
  assert(
    badges.every((b) => ['MERGED', 'OPEN', 'CLOSED'].includes(b.trim().toUpperCase())),
    `OS states rendered (${badges.join(', ')})`
  );
  assert(body.includes('#18317'), 'OS shows PR number');
  assert(body.includes('9243★'), 'OS shows contribution repo stars');
  const starMeta = await page.locator('.os-project .meta').allInnerTexts();
  assert(starMeta.some((t) => t.includes('34★')), 'OS project shows stars');
  await page.close();
}

// ---------- Writing ----------
{
  const page = await grab('/writing');
  const h1 = await page.locator('h1').first().innerText();
  assert(h1 === 'Writing', 'Writing h1');
  const links = await page.locator(".entry-title a[href*='/writing/']").allInnerTexts();
  assert(links.length === 1, `Writing list has ${links.length} post(s)`);
  await page.close();

  const detail = await grab('/writing/a-quiet-new-home');
  const h1d = await detail.locator('h1').first().innerText();
  assert(h1d === 'A quiet new home on the internet', 'Writing detail h1');
  const prose = await detail.locator('.prose').innerText();
  assert(prose.includes('text-first and intentionally boring'), 'Post body rendered');
  await detail.close();
}

// ---------- Values ----------
{
  const page = await grab('/values');
  const h1 = await page.locator('h1').first().innerText();
  assert(h1 === 'Values', 'Values h1');
  const valueTitles = await page.locator('.value-title').allInnerTexts();
  const expected = [
    'There is no greater good, do good today',
    'Give more than you take',
    'There is no talent, everything is a skill',
    'Have that dawg in you',
    'See things as they are',
    'Nobody is self-made',
  ];
  const ok =
    valueTitles.length === 6 &&
    valueTitles.every((t, i) => t.includes(expected[i].slice(0, 12)));
  assert(ok, `Values shows 6 in order (${valueTitles.length})`);
  await page.close();
}

// ---------- About ----------
{
  const page = await grab('/about');
  const body = await page.locator('body').innerText();
  assert(body.toLowerCase().includes('career'), 'About Career heading');
  assert(body.includes('Gojek'), 'Career includes Gojek');
  assert(body.includes('Junglee Games'), 'Career includes Junglee Games');
  assert(body.includes('Adda52'), 'Career includes Adda52');
  assert(body.includes('Mind Sports League'), 'Career includes Mind Sports League');
  assert(body.includes('Freelancer.com'), 'Career includes Freelancer');
  assert(body.toLowerCase().includes('education'), 'About Education heading');
  assert(body.includes('Savitribai Phule Pune University'), 'Education SPPU');
  assert(body.includes('S.S.G.M'), 'Education SSGM');
  assert(body.toLowerCase().includes('volunteering'), 'About Volunteering heading');
  assert(body.includes('World Health Organization'), 'Volunteering WHO');
  assert(body.includes('Google Developers Group'), 'Volunteering GDG');
  // newest first: Gojek should appear before Junglee in body text
  const gotoIdx = body.indexOf('Gojek');
  const jungleeIdx = body.indexOf('Junglee Games');
  assert(gotoIdx !== -1 && jungleeIdx !== -1 && gotoIdx < jungleeIdx, 'Career newest first (Gojek before Junglee)');
  const mediaImgs = await page.locator('.timeline-aside img').count();
  assert(mediaImgs === 13, `About timeline images = 13 (${mediaImgs})`);
  await page.close();
}

// ---------- SEO / meta ----------
{
  const page = await grab('/');
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  assert(Boolean(ogTitle), 'og:title present');
  assert(Boolean(description), 'meta description present');
  assert(ogImage && ogImage.includes('/og-default.svg'), `og:image present (${ogImage})`);
  const imgAlt = await page.locator("img").count();
  assert(imgAlt >= 1, `images on home (${imgAlt})`);
  const footerMeta = await page.locator('.site-footer-meta').innerText();
  assert(/©\s*20\d\d/.test(footerMeta), `Footer date formatted (${footerMeta.trim().slice(0, 30)})`);
  await page.close();
}

await browser.close();

// ---------- Static files ----------
{
  const res = await fetch(BASE + '/rss.xml');
  const rss = await res.text();
  assert(res.status === 200 && rss.includes('<rss'), 'RSS feed served');
  assert(rss.includes('A quiet new home'), 'RSS includes seed post');

  const robots = await (await fetch(BASE + '/robots.txt')).text();
  assert(robots.includes('Sitemap:'), 'robots.txt has sitemap');

  const sitemap = await (await fetch(BASE + '/sitemap-index.xml')).text();
  assert(sitemap.includes('<sitemap>'), 'sitemap index served');

  const favicon = await fetch(BASE + '/favicon.svg');
  assert(favicon.status === 200, 'favicon served');
}

console.log(failures.length ? `\n${failures.length} FAILURES` : '\nALL CHECKS PASSED');
process.exit(failures.length ? 1 : 0);