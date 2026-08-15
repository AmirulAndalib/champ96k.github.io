/**
 * GitHub sync — fetches public repository and contribution data for the site.
 *
 * Usage:
 *   npm run sync:github
 *
 * Reads an optional GITHUB_TOKEN from your environment / .env to avoid
 * rate limits (public data, no special scopes needed).
 *
 * Writes:
 *   src/data/github/repositories.json
 *   src/data/github/contributions.json
 *
 * The site never calls GitHub at request time — it reads these JSON files at
 * build time. Failures are graceful: if a request fails the script exits with
 * a nonzero code but never deletes the previously generated files, so a build
 * with slightly stale data still works.
 */

import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'champ96k';
const TOKEN = process.env.GITHUB_TOKEN ?? '';
const API = 'https://api.github.com';
const PER_PAGE = 100;
const MAX_REPOS = 300;
const MAX_CONTRIBUTIONS = 200;

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'champ96k.com-sync',
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../src/data/github');
const reposPath = resolve(outDir, 'repositories.json');
const contributionsPath = resolve(outDir, 'contributions.json');

async function api<T>(path: string): Promise<T> {
  const url = `${API}${path}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${url}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

async function apiAll<T>(path: string, max: number): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; ; page += 1) {
    const sep = path.includes('?') ? '&' : '?';
    const raw = await api<unknown>(`${path}${sep}per_page=${PER_PAGE}&page=${page}`);
    const items: T[] = Array.isArray(raw)
      ? (raw as T[])
      : ((raw as { items: T[] }).items ?? []);
    out.push(...items);
    if (items.length < PER_PAGE || out.length >= max) break;
  }
  return out;
}

interface RepoEntry {
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  homepage: string | null;
  license?: { spdx_id: string } | null;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface IssueItem {
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  repository_url: string;
  html_url: string;
  pull_request?: { merged_at: string | null; url: string };
}

interface RepoMeta {
  full_name: string;
  stargazers_count: number;
  language: string | null;
  description: string | null;
  html_url: string;
}

interface ContributionEntry {
  id: string;
  repository: string;
  repositoryUrl: string;
  type: 'Pull Request' | 'Issue';
  number: number;
  title: string;
  state: 'Merged' | 'Open' | 'Closed';
  date: string;
  url: string;
  stars?: number | null;
  language?: string | null;
  repoDescription?: string | null;
}

async function gather() {
  await mkdir(outDir, { recursive: true });

  // ---- Repositories ----
  const repos = (await apiAll<RepoEntry>(`/users/${USER}/repos`, MAX_REPOS)).map((r) => ({
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    language: r.language,
    topics: r.topics ?? [],
    stars: r.stargazers_count,
    forks: r.forks_count,
    url: r.html_url ?? `https://github.com/${r.full_name}`,
    homepage: r.homepage,
    license: r.license?.spdx_id ?? null,
    fork: r.fork,
    archived: r.archived,
    created_at: r.created_at,
    updated_at: r.updated_at,
    pushed_at: r.pushed_at,
  }));

  // ---- Contributions (PRs + issues authored by USER, outside their own repos) ----
  // GitHub's /search/issues returns both issues and pull requests; classify by
  // the presence of a `pull_request` field.
  const items = await apiAll<IssueItem>(
    `/search/issues?q=author:${USER}+type:pr&sort=created&order=desc`,
    MAX_CONTRIBUTIONS
  );
  const issueItems = await apiAll<IssueItem>(
    `/search/issues?q=author:${USER}+type:issue&sort=created&order=desc`,
    MAX_CONTRIBUTIONS
  );

  const external = (_items: IssueItem[]): IssueItem[] =>
    // Only work in repositories this user does not own (external contributions).
    _items.filter((item) => {
      const owner = item.repository_url.replace(`${API}/repos/`, '').split('/')[0];
      return owner !== USER;
    });

  const contributions: ContributionEntry[] = external([...items, ...issueItems])
    .map((item) => {
      const repo = item.repository_url.replace(`${API}/repos/`, '');
      const isPr = Boolean(item.pull_request);
      const merged = Boolean(item.pull_request?.merged_at);
      const state: 'Merged' | 'Open' | 'Closed' = merged
        ? 'Merged'
        : item.state === 'open'
          ? 'Open'
          : 'Closed';
      const repoUrl = `https://github.com/${repo}`;
      return {
        id: `${repo.replaceAll('/', '-')}-${item.number}`,
        repository: repo,
        repositoryUrl: repoUrl,
        type: isPr ? ('Pull Request' as const) : ('Issue' as const),
        number: item.number,
        title: item.title,
        state,
        date: (
          item.pull_request?.merged_at ??
          item.closed_at ??
          item.created_at
        ).slice(0, 10),
        url: isPr
          ? `${repoUrl}/pull/${item.number}`
          : `${repoUrl}/issues/${item.number}`,
      };
    });

  // Enrich contributions with the target repo's stars / description / language
  // so the site can show "what repo I contributed to" without extra lookups.
  const uniqueRepos = [...new Set(contributions.map((c) => c.repository))].sort();
  const repoMeta = new Map<string, RepoMeta>();
  for (const repo of uniqueRepos) {
    try {
      const meta = await api<RepoMeta>(`/repos/${repo}`);
      repoMeta.set(repo, meta);
    } catch (error) {
      console.warn(`Could not fetch repo ${repo}: ${(error as Error).message}`);
    }
  }
  for (const entry of contributions) {
    const meta = repoMeta.get(entry.repository);
    entry.stars = meta?.stargazers_count ?? null;
    entry.language = meta?.language ?? null;
    entry.repoDescription = meta?.description ?? null;
  }

  const payload = {
    _meta: {
      synced_at: new Date().toISOString(),
      source: `https://github.com/${USER}`,
      user: USER,
      counts: { repositories: repos.length, contributions: contributions.length },
    },
    repositories: repos,
    contributions,
  };
  const repositoriesMeta = {
    _meta: {
      synced_at: new Date().toISOString(),
      source: `https://github.com/${USER}`,
      user: USER,
      count: repos.length,
    },
    repositories: repos,
  };

  await writeFile(
    reposPath,
    JSON.stringify(repositoriesMeta, null, 2) + '\n',
    'utf8'
  );
  await writeFile(
    contributionsPath,
    JSON.stringify(payload, null, 2) + '\n',
    'utf8'
  );

  console.log(
    `Synced ${repos.length} repositories and ${contributions.length} external contributions.`
  );
  console.log(`→ ${reposPath}`);
  console.log(`→ ${contributionsPath}`);
}

gather().catch((error) => {
  console.error('\nGitHub sync failed:', error.message);
  console.error('Existing generated data was left untouched.');
  process.exit(1);
});