// 사이트 안 링크 주소를 한곳에서 만듭니다.
// astro.config.mjs의 trailingSlash: 'always'와 맞춰 모든 페이지 주소는 끝 슬래시를 붙입니다.
// (canonical, RSS, 사이트맵도 같은 형태라서 같은 글이 두 가지 주소로 나뉘지 않습니다.)

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

// 관련 글이 여러 개인 프로젝트의 글 목록 페이지
export function projectPostsUrl(id: string): string {
  return `/projects/${id}/`;
}

// Projects 페이지 안의 해당 프로젝트 위치
export function projectAnchorUrl(id: string): string {
  return `${PROJECTS_URL}#${id}`;
}
