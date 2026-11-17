import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from './format';

export type Post = CollectionEntry<'posts'>;

export interface TagCount {
  tag: string; // 화면에 보여줄 이름 (처음 등장한 표기)
  slug: string; // URL에 쓸 이름
  count: number; // 이 태그가 붙은 공개 글 수
}

export interface AdjacentPosts {
  prev?: Post; // 이전 글 = 더 오래된 글
  next?: Post; // 다음 글 = 더 최신 글
}

// 공개 글의 project가 실제 projects 컬렉션에 있는지 확인합니다.
// Astro는 없는 id를 [ERROR] 로그만 남기고 빌드를 계속하므로, 여기서 직접 빌드를 멈춥니다.
// draft는 배포되지 않으므로 검사하지 않습니다(공개로 바꾸는 순간 검사 대상이 됩니다).
async function assertProjectRefs(posts: Post[]): Promise<void> {
  const projects = await getCollection('projects');
  const projectIds = new Set(projects.map((project) => project.id));
  for (const post of posts) {
    const ref = post.data.project?.id;
    if (ref && !projectIds.has(ref)) {
      throw new Error(
        `글 "${post.id}"의 project "${ref}"가 projects 컬렉션에 없습니다. (등록된 id: ${[...projectIds].join(', ')})`,
      );
    }
  }
}

// draft를 빼고 최신순으로 정렬한 글 목록
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  await assertProjectRefs(posts);
  return posts.toSorted(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || b.id.localeCompare(a.id),
  );
}

// 아래 함수들은 마지막 인자로 getPublishedPosts()의 결과를 받을 수 있습니다.
// getStaticPaths처럼 같은 목록으로 여러 번 호출하는 곳에서는 한 번 받아 둔 배열을 넘겨서
// 매번 컬렉션을 다시 읽고 정렬하지 않게 합니다. 넘기지 않으면 직접 가져옵니다.

// 태그별 글 수 (많은 순, 같으면 이름순)
export async function getAllTags(posts?: Post[]): Promise<TagCount[]> {
  const list = posts ?? (await getPublishedPosts());
  const counts = new Map<string, TagCount>();

  for (const post of list) {
    const seen = new Set<string>(); // 한 글 안에서 같은 태그를 두 번 세지 않기 위해
    for (const tag of post.data.tags) {
      const slug = slugify(tag);
      if (slug === '' || seen.has(slug)) continue;
      seen.add(slug);

      const current = counts.get(slug);
      if (current) {
        current.count += 1;
      } else {
        counts.set(slug, { tag, slug, count: 1 });
      }
    }
  }

  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ko'),
  );
}

// 특정 태그(slug 기준)가 붙은 글
export async function getPostsByTag(slug: string, posts?: Post[]): Promise<Post[]> {
  const list = posts ?? (await getPublishedPosts());
  return list.filter((post) => post.data.tags.some((tag) => slugify(tag) === slug));
}

// 이전 글(더 오래된 글)과 다음 글(더 최신 글)
export async function getAdjacentPosts(id: string, posts?: Post[]): Promise<AdjacentPosts> {
  const list = posts ?? (await getPublishedPosts()); // 최신순: [0]이 가장 최신
  const index = list.findIndex((post) => post.id === id);
  if (index === -1) return {}; // draft이거나 없는 id

  return {
    prev: list.at(index + 1), // 배열 끝을 넘으면 undefined
    next: index > 0 ? list.at(index - 1) : undefined, // at(-1)은 마지막 요소라서 막아야 함
  };
}

// 특정 프로젝트(projects 컬렉션의 id)에 연결된 글
export async function getPostsByProject(projectId: string, posts?: Post[]): Promise<Post[]> {
  const list = posts ?? (await getPublishedPosts());
  return list.filter((post) => post.data.project?.id === projectId);
}

export interface SeriesInfo {
  name: string; // 화면에 보여줄 이름 (처음 등장한 표기)
  slug: string; // URL에 쓸 이름
  posts: Post[]; // 시리즈 순서대로 정렬된 공개 글
}

// 시리즈 안의 순서: seriesOrder가 작은 글이 앞, seriesOrder가 없는 글은 뒤에 작성일 순
function compareInSeries(a: Post, b: Post): number {
  const orderA = a.data.seriesOrder ?? Number.POSITIVE_INFINITY;
  const orderB = b.data.seriesOrder ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) return orderA - orderB;
  return a.data.date.valueOf() - b.data.date.valueOf() || a.id.localeCompare(b.id);
}

// 전체 시리즈 목록 (가장 최근에 글이 올라온 시리즈가 앞)
// 이름 표기만 다른 시리즈(대소문자, 공백)는 slug가 같으므로 하나로 합쳐진다.
export async function getAllSeries(posts?: Post[]): Promise<SeriesInfo[]> {
  const list = posts ?? (await getPublishedPosts());
  const bySlug = new Map<string, SeriesInfo>();

  for (const post of list) {
    const name = post.data.series;
    if (!name) continue;
    const slug = slugify(name);
    if (slug === '') continue;

    const current = bySlug.get(slug);
    if (current) current.posts.push(post);
    else bySlug.set(slug, { name, slug, posts: [post] });
  }

  const latest = (series: SeriesInfo) => Math.max(...series.posts.map((p) => p.data.date.valueOf()));
  return [...bySlug.values()]
    .map((series) => ({ ...series, posts: series.posts.toSorted(compareInSeries) }))
    .sort((a, b) => latest(b) - latest(a) || a.name.localeCompare(b.name, 'ko'));
}

// 글이 속한 시리즈 (없으면 undefined)
export async function getSeriesOf(post: Post, posts?: Post[]): Promise<SeriesInfo | undefined> {
  if (!post.data.series) return undefined;
  const slug = slugify(post.data.series);
  return (await getAllSeries(posts)).find((series) => series.slug === slug);
}
