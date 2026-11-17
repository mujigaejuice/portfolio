import { getCollection, type CollectionEntry } from 'astro:content';
import { slugifyTag } from './format';

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

// 글의 project가 실제 projects 컬렉션에 있는지 확인합니다.
// Astro는 없는 id를 [ERROR] 로그만 남기고 빌드를 계속하므로, 여기서 직접 빌드를 멈춥니다.
async function assertProjectRefs(): Promise<void> {
  const [posts, projects] = await Promise.all([getCollection('posts'), getCollection('projects')]);
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
  await assertProjectRefs();
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.toSorted(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || b.id.localeCompare(a.id),
  );
}

// 태그별 글 수 (많은 순, 같으면 이름순)
export async function getAllTags(): Promise<TagCount[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, TagCount>();

  for (const post of posts) {
    const seen = new Set<string>(); // 한 글 안에서 같은 태그를 두 번 세지 않기 위해
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
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
export async function getPostsByTag(slug: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.tags.some((tag) => slugifyTag(tag) === slug));
}

// 이전 글(더 오래된 글)과 다음 글(더 최신 글)
export async function getAdjacentPosts(id: string): Promise<AdjacentPosts> {
  const posts = await getPublishedPosts(); // 최신순: [0]이 가장 최신
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return {}; // draft이거나 없는 id

  return {
    prev: posts.at(index + 1), // 배열 끝을 넘으면 undefined
    next: index > 0 ? posts.at(index - 1) : undefined, // at(-1)은 마지막 요소라서 막아야 함
  };
}

// 특정 프로젝트(projects 컬렉션의 id)에 연결된 글
export async function getPostsByProject(projectId: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.project?.id === projectId);
}
