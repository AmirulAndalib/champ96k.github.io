import type { Contribution, SyncedContribution, SyncedRepository } from '@/types';
import repositoriesJson from '../data/github/repositories.json';
import contributionsJson from '../data/github/contributions.json';

interface RepositoriesFile {
  repositories?: SyncedRepository[];
}
interface ContributionsFile {
  contributions?: SyncedContribution[];
}

export async function loadSyncedRepositories(): Promise<SyncedRepository[]> {
  const data = repositoriesJson as RepositoriesFile;
  return Array.isArray(data?.repositories) ? data.repositories : [];
}

export async function loadSyncedContributions(): Promise<SyncedContribution[]> {
  const data = contributionsJson as ContributionsFile;
  return Array.isArray(data?.contributions) ? data.contributions : [];
}

/** Repos that are genuinely open source: mine, not forks, not archived. */
export function publicOpenSourceRepos(
  repos: SyncedRepository[]
): SyncedRepository[] {
  return repos.filter((r) => !r.fork && !r.archived);
}

/** Merge synced contributions (dynamic) with curated fallbacks, deduped. */
export function mergeContributions(
  synced: SyncedContribution[],
  curated: Contribution[]
): Contribution[] {
  const map = new Map<string, Contribution>();

  const keyOf = (repo: string, number?: number) =>
    `${repo.toLowerCase()}#${number ?? ''}`;

  for (const c of synced) {
    map.set(keyOf(c.repository, c.number), {
      id: c.id,
      repository: c.repository,
      repositoryUrl: c.repositoryUrl,
      type: c.type ?? 'Pull Request',
      number: c.number,
      title: c.title,
      state: c.state,
      date: c.date,
      url: c.url,
      stars: c.stars ?? undefined,
      repoDescription: c.repoDescription ?? null,
      language: c.language ?? null,
    });
  }
  for (const c of curated) {
    const key = keyOf(c.repository, c.number);
    if (!map.has(key)) {
      map.set(key, { ...c, type: c.type ?? 'Pull Request' });
    }
  }

  return [...map.values()].sort(
    (a, b) => (b.date || '').localeCompare(a.date || '')
  );
}