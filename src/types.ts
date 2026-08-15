export interface ProfileData {
  name: string;
  title: string;
  headline: string;
  tagline: string;
  about: string;
  location: string;
  email: string;
  github?: string;
  image?: string;
  current?: {
    role: string;
    company: string;
    company_url?: string;
    location: string;
    blurb?: string;
    working_on?: string[];
    learning?: string[];
  };
}

export interface SocialEntry {
  label: string;
  handle?: string;
  url: string;
  username?: string;
}

export interface SocialData {
  [platform: string]: SocialEntry;
}

export interface Value {
  order: number;
  title: string;
  description: string;
}

export interface CareerEntry {
  company: string;
  role: string;
  start: string;
  end: string;
  location?: string;
  employment?: string;
  description?: string;
  highlights?: string[];
  technologies?: string[];
  link?: string;
  company_url?: string;
  image?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  start: string;
  end: string;
  description?: string;
  image?: string;
}

export interface VolunteeringEntry {
  org: string;
  role: string;
  start: string;
  end: string;
  description?: string;
  link?: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  tags?: string[];
  image?: string;
  url?: string;
  github?: string;
  status?: string;
  technologies?: string[];
  overview?: string;
  what_i_built?: string[];
  links?: { label: string; url: string }[];
}

export interface OpenSourceRepo {
  id?: string;
  /** owner/name — the only field that strictly matters; the rest is fetched. */
  repository: string;
  title?: string;
  description?: string;
  role?: string;
  tags?: string[];
  image?: string;
  homepage?: string;
  stars?: number;
  featured?: boolean;
}

export interface Contribution {
  id: string;
  repository: string;
  repositoryUrl?: string;
  type: 'Pull Request' | 'Issue' | 'Commit';
  number?: number;
  title?: string;
  description?: string;
  state: 'Merged' | 'Open' | 'Closed';
  date: string;
  url?: string;
  showOnWebsite?: boolean;
  stars?: number;
  repoDescription?: string | null;
  language?: string | null;
}

export interface OpenSourceData {
  intro?: string;
  my_projects: OpenSourceRepo[];
  contributions: Contribution[];
}

/** Mirrors a row of src/data/github/repositories.json (from sync:github). */
export interface SyncedRepository {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  url: string;
  homepage: string | null;
  license: string | null;
  fork: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

/** Mirrors a row of src/data/github/contributions.json (from sync:github). */
export interface SyncedContribution {
  id: string;
  repository: string;
  repositoryUrl: string;
  number: number;
  title: string;
  state: 'Merged' | 'Open' | 'Closed';
  date: string;
  url: string;
  type: 'Pull Request' | 'Issue';
  stars?: number | null;
  repoDescription?: string | null;
  language?: string | null;
}

export interface WritingPost {
  id: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  type?: string;
  draft?: boolean;
  cover?: string;
}