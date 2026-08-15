import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { yamlFile } from '@/loaders/yamlFile';

const projects = defineCollection({
  loader: yamlFile('src/data/projects.yaml', { idField: 'id' }),
  schema: z
    .object({
      id: z.string(),
      title: z.string().default('Untitled'),
      description: z.string().default(''),
      date: z.string().default(''),
      type: z.string().default(''),
    })
    .partial()
    .passthrough(),
});

const openSource = defineCollection({
  loader: yamlFile('src/data/open-source.yaml', { single: true }),
  schema: z.any(),
});

const values = defineCollection({
  loader: yamlFile('src/data/values.yaml'),
  schema: z
    .object({
      order: z.number().default(1),
      title: z.string().default(''),
      description: z.string().default(''),
    })
    .partial()
    .passthrough(),
});

const career = defineCollection({
  loader: yamlFile('src/data/career.yaml'),
  schema: z
    .object({
      company: z.string().default(''),
      role: z.string().default(''),
      start: z.string().default(''),
      end: z.string().default(''),
    })
    .partial()
    .passthrough(),
});

const education = defineCollection({
  loader: yamlFile('src/data/education.yaml'),
  schema: z
    .object({
      institution: z.string().default(''),
      degree: z.string().default(''),
      start: z.coerce.string().default(''),
      end: z.coerce.string().default(''),
    })
    .partial()
    .passthrough(),
});

const volunteering = defineCollection({
  loader: yamlFile('src/data/volunteering.yaml'),
  schema: z
    .object({
      org: z.string().default(''),
      role: z.string().default(''),
      start: z.string().default(''),
      end: z.string().default(''),
    })
    .partial()
    .passthrough(),
});

const profile = defineCollection({
  loader: yamlFile('src/data/profile.yaml', { single: true }),
  schema: z
    .object({
      name: z.string().default('Tushar Nikam'),
      title: z.string().default('Software Engineer'),
    })
    .partial()
    .passthrough(),
});

const social = defineCollection({
  loader: yamlFile('src/data/social.yaml'),
  schema: z
    .object({
      label: z.string().default(''),
      url: z.string().default(''),
    })
    .partial()
    .passthrough(),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    type: z.string().default('Notes'),
    draft: z.boolean().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = {
  projects,
  openSource,
  values,
  career,
  education,
  volunteering,
  profile,
  social,
  writing,
};