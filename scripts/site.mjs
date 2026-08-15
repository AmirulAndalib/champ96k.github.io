#!/usr/bin/env node
/**
 * champ96k.com — helper CLI for common local workflows.
 *
 * Usage:
 *   node scripts/site.mjs dev        start the dev server (stops strays first)
 *   node scripts/site.mjs build      clear stale cache, type-check, build
 *   node scripts/site.mjs preview    clear cache, build, serve dist, run DOM checks
 *   node scripts/site.mjs sync       GitHub sync (tolerates a bad GITHUB_TOKEN)
 *   node scripts/site.mjs verify     clear cache + build + preview + DOM checks
 *   node scripts/site.mjs help       this help
 *
 * dom-check.mjs expects a preview on port 4321, so that's the port used here.
 */

import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const run = (cmd, args, opts = {}) => {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: root,
    shell: true,
    ...opts,
  });
  return res.status ?? 1;
};

const clearCaches = () => {
  for (const p of ['.astro', 'node_modules/.astro', 'dist']) {
    rmSync(resolve(root, p), { recursive: true, force: true });
  }
  console.log('Cleared .astro / node_modules/.astro / dist.');
};

const stopDev = () => run('npx', ['astro', 'dev', 'stop'], {});
const stopPreview = () => run('npx', ['astro', 'preview', 'stop'], {});

const help = () => {
  console.log(`
Site helpers — run from the repo root:

  node scripts/site.mjs dev        start dev server (stops stray ones first)
  node scripts/site.mjs build      clear cache, type-check, static build
  node scripts/site.mjs preview    clear cache, build, serve dist on :4321, DOM checks
  node scripts/site.mjs sync       GitHub data sync (ignores a bad GITHUB_TOKEN)
  node scripts/site.mjs verify     cache-clear + build + preview + DOM checks
  node scripts/site.mjs help       this help
`);
};

const arg = process.argv[2] ?? 'help';

switch (arg) {
  case 'dev':
    stopDev();
    run('npm', ['run', 'dev']);
    break;

  case 'build':
    clearCaches();
    run('npm', ['run', 'check']);
    run('npm', ['run', 'build']);
    break;

  case 'preview':
    clearCaches();
    run('npm', ['run', 'check']);
    run('npm', ['run', 'build']);
    stopPreview();
    run('npm', ['run', 'preview', '--', '--port', '4321'], { detached: true });
    // Give the server a moment, then run the DOM checks against it.
    setTimeout(() => {
      run('npm', ['run', 'test:pages']);
      stopPreview();
    }, 2500);
    break;

  case 'sync':
    // The user's shell may export an invalid GITHUB_TOKEN that breaks auth.
    run('env', ['-u', 'GITHUB_TOKEN', 'npm', 'run', 'sync:github']);
    break;

  case 'verify':
    clearCaches();
    run('npm', ['run', 'check']);
    run('npm', ['run', 'build']);
    stopPreview();
    run('npm', ['run', 'preview', '--', '--port', '4321'], { detached: true });
    setTimeout(() => {
      run('npm', ['run', 'test:pages']);
      stopPreview();
    }, 2500);
    break;

  case 'help':
  default:
    help();
    break;
}