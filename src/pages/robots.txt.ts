import type { APIRoute } from 'astro';

// site 설정에서 주소를 만들기 때문에, 배포 주소를 바꿀 때 이 파일은 고칠 필요가 없다.
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('/sitemap-index.xml', site);
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapURL.href}`, ''].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
