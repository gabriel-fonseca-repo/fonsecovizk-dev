import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  return rss({
    title: "Feed RSS do Blog",
    description: "Pra quem quiser acompanhar os novos posts sem precisar entrar no site",
    site: context.site ? context.site.toString() : "https://fonsecovizk.dev/",
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
    })),
  });
}
