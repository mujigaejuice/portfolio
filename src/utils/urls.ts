// 사이트 안 링크 주소를 한곳에서 만듭니다.
// astro.config.mjs의 trailingSlash: 'always'와 맞춰 모든 페이지 주소는 끝 슬래시를 붙입니다.
// (canonical, 사이트맵도 같은 형태라서 같은 글이 두 가지 주소로 나뉘지 않습니다.)

export const HOME_URL = '/';
export const POSTS_URL = '/posts/';
export const PROJECTS_URL = '/projects/';

export function postUrl(id: string): string {
  return `/posts/${id}/`;
}

// slug에 한글이 있으면 퍼센트 인코딩된 주소가 됩니다(canonical과 같은 표기).
export function tagUrl(slug: string): string {
  return `/tags/${encodeURIComponent(slug)}/`;
}

export function seriesUrl(slug: string): string {
  return `/series/${encodeURIComponent(slug)}/`;
}

// 프로젝트 상세 페이지 (소개 본문 + 관련 글)
export function projectUrl(id: string): string {
  return `/projects/${id}/`;
}
