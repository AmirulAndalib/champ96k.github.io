import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export async function GET(context: { site: URL }) {
  const posts = (await getCollection('writing'))
    .filter((post) => post.data.draft !== true)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `${SITE_NAME} — Writing`,
    description: 'Everything Tushar Nikam writes — technology, career, notes and opinions.',
    site: context.site ?? SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
      categories: [...(post.data.tags ?? []), post.data.type],
    })),
    customData: '<language>en</language>',
  });
}