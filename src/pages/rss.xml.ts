import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getPublishedPosts } from '../utils/posts';

export async function GET(context: APIContext) {
  // context.site는 astro.config.mjs의 site (URL | undefined)
  const site = context.site;
  if (!site) {
    throw new Error('astro.config.mjs에 site를 설정해야 RSS를 만들 수 있습니다.');
  }

  // draft 제외 + 최신 글이 위로. 목록 페이지와 같은 함수를 써서 기준이 어긋나지 않게 한다.
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/posts/${post.id}/`, // site 기준 상대 경로 → 절대 URL로 변환됨
      categories: post.data.tags,
    })),
    customData: '<language>ko-kr</language>',
  });
}
