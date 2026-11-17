# 포트폴리오 기술 블로그 구현 계획

와이어프레임(About / Projects / Posts / Post 상세)을 실제 사이트로 만드는 계획입니다. 각 단계는 끝났을 때 확인할 수 있는 결과물로 마무리되도록 나눴습니다.

## 0. 개요

| 항목 | 결정 |
| --- | --- |
| 프레임워크 | Astro (TypeScript strict) |
| 콘텐츠 | Markdown (`.md`) + Content Collections |
| 스타일 | CSS 변수 기반 전역 스타일 (Tailwind 없이 시작) |
| 코드 하이라이트 | Astro 내장 Shiki (다크 테마) |
| 배포 | GitHub → Vercel 자동 배포 (대안: GitHub Pages) |
| 예상 기간 | 3~5일 (주말 2번 정도) |

### 사이트 구조

| 경로 | 페이지 | 내용 |
| --- | --- | --- |
| `/` | About | 소개, 이력서·Email 버튼, 대표 프로젝트 3개, 최근 글 3개 |
| `/projects` | Projects | 프로젝트 목록 (상태, 설명, 스택, GitHub, 관련 글, 논문 PDF) |
| `/posts` | Posts | 태그 필터 + 글 목록 |
| `/tags/[tag]` | 태그별 글 | Posts와 같은 목록, 해당 태그만 |
| `/posts/[slug]` | Post 상세 | 제목, 날짜·태그, 본문, 이전·다음 글 |
| `/rss.xml` | RSS | 글 피드 |

### 디자인 토큰

```css
:root {
  --bg: #0E1420;        /* 검은색에 가까운 남색 배경 */
  --text: #E8ECF2;      /* 본문 텍스트 */
  --text-sub: #C5CCD8;  /* 설명 텍스트 */
  --text-muted: #9AA4B5;/* 날짜, 메타 정보 */
  --border: #2A3448;    /* 카드 테두리 */
  --divider: #222B3D;   /* 목록 구분선 */
  --surface: #1C2536;   /* 이미지 자리, 코드 블록 배경 */
  --mint: #5EE6C2;      /* 주요 동작: 현재 메뉴, 주 버튼, 선택된 태그, 링크 hover */
  --pink: #F7B8CC;      /* 강조 정보: 진행 상태, 논문 링크 */
  --content-width: 960px;
}
```

색 사용 규칙은 두 가지입니다. 민트는 "누를 수 있는 것, 현재 위치"에만 쓰고, 핑크는 "읽어야 할 상태 정보"에만 씁니다. 민트 배경 버튼의 글자색은 `--bg`를 씁니다.

### 폴더 구조

```
portfolio/
├─ public/
│  ├─ resume.pdf
│  ├─ papers/              # 논문 PDF
│  └─ fonts/               # Pretendard 또는 Noto Sans KR (woff2)
├─ src/
│  ├─ content/
│  │  ├─ posts/            # 글: 2026-11-20-first-post.md
│  │  └─ projects/         # 프로젝트: deepmesh.md
│  ├─ components/
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ ProjectCard.astro # 홈 카드형
│  │  ├─ ProjectItem.astro # Projects 목록형
│  │  ├─ PostRow.astro
│  │  └─ TagFilter.astro
│  ├─ layouts/
│  │  ├─ BaseLayout.astro
│  │  └─ PostLayout.astro
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ projects.astro
│  │  ├─ posts/index.astro
│  │  ├─ posts/[...slug].astro
│  │  ├─ tags/[tag].astro
│  │  └─ rss.xml.ts
│  ├─ styles/global.css
│  ├─ utils/posts.ts       # 정렬, draft 제외, 이전·다음 글 계산
│  └─ content.config.ts
├─ astro.config.mjs
└─ package.json
```

---

## 1단계. 프로젝트 세팅 (반나절)

목표: 빈 페이지 4개가 공통 헤더·푸터와 색 테마를 갖고 로컬에서 뜨는 상태.

### 작업 내용

1. `npm create astro@latest portfolio`로 생성합니다. 템플릿은 Empty, TypeScript는 Strict를 고릅니다.
2. Git 저장소를 만들고 첫 커밋을 합니다.
3. `src/styles/global.css`에 위 디자인 토큰, 기본 타이포그래피(본문 16~17px, line-height 1.6~1.8), 링크 색, `:focus-visible` 외곽선(민트)을 넣습니다.
4. 폰트를 `public/fonts/`에 두고 `@font-face`로 불러옵니다. 한글 웹폰트는 용량이 크니 서브셋 버전(woff2)을 씁니다.
5. `BaseLayout.astro`를 만듭니다. props로 `title`, `description`을 받아 `<head>`에 넣고, Header·Footer로 본문을 감쌉니다.
6. `Header.astro`에서 `Astro.url.pathname`으로 현재 메뉴를 판별해 민트로 표시합니다. `/posts/...`, `/tags/...`에서는 Posts가 활성화되게 합니다.
7. `index.astro`, `projects.astro`, `posts/index.astro`를 제목만 있는 상태로 만듭니다.

### 체크리스트

- [x] Astro 프로젝트 생성 (Empty, TypeScript strict)
- [x] Git 저장소 생성, `.gitignore` 확인, 첫 커밋
- [x] `global.css`에 색 변수, 기본 글꼴 크기, 링크 색 정의
- [x] `:focus-visible` 외곽선 스타일 추가
- [x] 한글 웹폰트 woff2 추가 및 `@font-face` 설정
- [x] `BaseLayout.astro` 작성 (title, description props)
- [x] `Header.astro` 작성, 현재 메뉴 민트 강조
- [x] `Footer.astro` 작성 (저작권, GitHub 링크)
- [x] 빈 페이지 3개(`/`, `/projects`, `/posts`) 생성
- [x] `npm run dev`로 세 페이지 이동 확인
- [x] 모바일 폭(375px)에서 헤더 메뉴가 줄바꿈되는지 확인

---

## 2단계. 콘텐츠 모델 (반나절)

목표: 글과 프로젝트를 Markdown 파일로 추가하면 형식 검사를 거쳐 불러와지는 상태.

### 작업 내용

`src/content.config.ts`에 두 컬렉션을 정의합니다.

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    draft: z.boolean().default(false),
    project: z.string().optional(), // projects 컬렉션의 id (예: 'deepmesh')
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['진행 중', '완료']),
    summary: z.string(),
    stack: z.array(z.string()),
    github: z.string().url().optional(),
    paper: z.string().optional(),   // '/papers/deepmesh.pdf'
    order: z.number(),              // 작을수록 앞
    featured: z.boolean().default(false), // 홈에 노출
  }),
});

export const collections = { posts, projects };
```

`src/utils/posts.ts`에는 공통 함수를 둡니다.

- `getPublishedPosts()`: `draft: true`를 빼고 날짜 내림차순으로 정렬
- `getAllTags()`: 태그별 글 수 집계
- `getAdjacentPosts(id)`: 이전·다음 글
- `getPostsByProject(projectId)`: 프로젝트의 관련 글

글 파일 이름은 `YYYY-MM-DD-slug.md` 형식으로 통일하면 폴더에서 날짜순으로 보여서 관리하기 편합니다.

### 체크리스트

- [x] `content.config.ts`에 posts, projects 스키마 정의
- [x] 프로젝트 파일 3개 작성 (deepmesh, icatch, call-desk)
- [x] 테스트용 글 3개 작성 (태그 겹치게, 하나는 `project: deepmesh`)
- [x] `draft: true` 글 1개 작성 (목록에 안 나오는지 확인용)
- [x] `utils/posts.ts`에 정렬·draft 제외·태그 집계·이전다음·관련 글 함수 작성
- [x] 필수 필드를 일부러 빼서 빌드 에러가 나는지 확인

---

## 3단계. 페이지 구현 (1~2일)

목표: 와이어프레임 4개 페이지가 실제 콘텐츠로 동작하는 상태.

### 3-1. About (`/`)

- 소개 문구와 버튼 2개: 이력서(`/resume.pdf`, 민트 배경), Email(`mailto:`, 테두리 버튼)
- 프로젝트: `featured: true`를 `order`순으로 최대 3개, `ProjectCard`로 3열 그리드 (좁은 화면에서 1열)
- 최근 글: `getPublishedPosts()` 상위 3개, `PostRow`로 표시

### 3-2. Projects (`/projects`)

- 전체 프로젝트를 `order`순으로 `ProjectItem`으로 나열
- 각 항목: 상태(핑크) / 이름 / 설명 / 스택 / GitHub / 관련 글 / 논문 PDF(있을 때만, 핑크)
- 관련 글 링크: 관련 글이 1개면 그 글로, 여러 개면 `/posts`의 해당 태그나 목록으로 연결. 없으면 링크를 숨깁니다.

### 3-3. Posts (`/posts`, `/tags/[tag]`)

- 상단에 `TagFilter`: "전체" + 태그 목록. 현재 태그는 민트 배경
- 태그 버튼은 `<a href="/tags/kubernetes">` 링크로 만듭니다. JS 없이 정적 페이지로 동작합니다.
- `tags/[tag].astro`는 `getStaticPaths()`로 태그마다 페이지를 생성하고, Posts와 같은 목록 컴포넌트를 재사용합니다.
- 태그 URL은 소문자, 공백은 `-`로 바꿉니다. 한글 태그는 그대로 써도 동작하지만 URL이 인코딩되므로, 가능하면 영문 태그를 권장합니다.

### 3-4. Post 상세 (`/posts/[...slug]`)

- `PostLayout.astro`: 뒤로가기(Posts), 제목, 날짜·태그, 본문, 이전·다음 글
- 본문 스타일: 최대 폭 720px, 제목(h2, h3) 간격, 이미지 `max-width: 100%`, 표와 코드 블록은 가로 스크롤
- 코드 하이라이트: `astro.config.mjs`에서 Shiki 다크 테마 지정 (예: `github-dark`). 배경을 `--surface`와 맞출지 확인
- 이미지는 글 옆에 두고 상대 경로로 넣으면 Astro가 최적화합니다.

### 체크리스트

- [x] `ProjectCard`, `ProjectItem`, `PostRow`, `TagFilter` 컴포넌트 작성
- [x] About: 소개, 버튼 2개, featured 프로젝트 3개, 최근 글 3개
- [x] Projects: 전체 목록, 상태 핑크, 논문 PDF 조건부 노출
- [x] Projects: 관련 글 링크 연결 (없으면 숨김)
- [x] Posts: 태그 필터 + 글 목록
- [x] `/tags/[tag]` 정적 페이지 생성, 현재 태그 민트 표시
- [x] Post 상세: 제목, 메타, 본문, 이전·다음 글
- [x] Shiki 다크 테마 적용, 긴 코드 가로 스크롤 확인
- [x] 본문 안 이미지, 표, 인용, 목록 스타일 확인
- [x] 375px / 768px / 1280px 폭에서 네 페이지 모두 확인
- [x] 키보드 Tab으로 모든 링크·버튼 이동 가능, 포커스 표시 확인
- [x] 글이 0개인 태그나 관련 글 없는 프로젝트에서 깨지지 않는지 확인

---

## 4단계. 마무리 (반나절)

목표: 공유하고 검색되기에 문제가 없는 상태.

### 작업 내용

- RSS: `@astrojs/rss`로 `src/pages/rss.xml.ts` 작성. 푸터와 `<head>`에 RSS 링크
- 사이트맵: `@astrojs/sitemap` 추가, `astro.config.mjs`의 `site`에 배포 주소 설정
- 메타 태그: 페이지별 `title`, `description`, `og:title`, `og:description`, `og:image`
- OG 이미지: 우선 사이트 공통 이미지 1장 (1200×630, 남색 배경에 이름). 글별 이미지는 나중에
- `favicon.svg` 추가
- 404 페이지 (`src/pages/404.astro`)
- 이력서·논문 PDF를 `public/`에 넣고 링크 확인

### 체크리스트

- [x] RSS 피드 생성, draft 글 제외 확인
- [x] 사이트맵 생성, `site` 설정
- [x] 페이지별 title, description 지정
- [x] 공통 OG 이미지 1장 제작 및 적용
- [x] favicon 추가
- [x] 404 페이지 작성
- [x] 이력서 PDF, 논문 PDF 링크 동작 확인 (현재 `public/resume.pdf`, `public/papers/deepmesh.pdf`는 임시 파일. 실제 파일로 교체 필요)
- [x] `npm run build` 경고 없이 통과
- [x] `npm run preview`로 빌드 결과 최종 확인
- [x] Lighthouse로 성능·접근성 점수 확인 (90점 이상 목표) — 접근성·권장사항·SEO는 전 페이지 100점. 성능은 글 이미지가 LCP인 페이지만 81점(시뮬레이션, 실측 LCP 0.3초), 나머지 92~100점

---

## 5단계. 배포 (1~2시간)

목표: 공개 주소에서 사이트가 열리고, push하면 자동으로 갱신되는 상태.

### 작업 내용 (Vercel 기준)

1. GitHub에 저장소를 push합니다.
2. Vercel에서 해당 저장소를 Import합니다. Astro는 자동 인식되므로 설정을 바꿀 필요가 거의 없습니다.
3. 배포 주소를 `astro.config.mjs`의 `site`에 넣고 다시 push합니다 (사이트맵·RSS 주소가 맞게 생성되도록).
4. 커스텀 도메인을 쓸 경우 Vercel Domains에서 추가하고 DNS를 설정합니다.

GitHub Pages를 쓸 경우 Astro 공식 GitHub Actions 워크플로를 사용하고, 저장소 이름이 경로에 붙으면 `base` 설정이 필요합니다.

### 체크리스트

- [ ] GitHub 저장소 push
- [ ] Vercel 연결 및 첫 배포 성공
- [ ] `site` 값을 실제 주소로 수정
- [ ] 글 하나 추가 후 push → 자동 배포 확인
- [ ] 휴대폰으로 실제 주소 접속 확인
- [ ] 끝 슬래시 없는 주소(`/posts`)로 접속해도 열리는지 확인 (로컬 dev/preview는 `trailingSlash: 'always'` 때문에 404가 정상)
- [ ] 링크 공유 시 미리보기(OG) 확인 (카카오톡, 슬랙 등)
- [ ] (선택) 커스텀 도메인 연결

---

## 6단계. 글이 쌓인 뒤 추가할 것

와이어프레임에서 뺀 요소들입니다. 구조를 바꾸지 않고 붙일 수 있습니다.

| 기능 | 붙일 시점 | 방법 |
| --- | --- | --- |
| 검색 | 글 15개 이상 | Pagefind (빌드 후 정적 인덱스 생성, 서버 불필요) |
| 시리즈 | 같은 주제 글 3개 이상 | posts 스키마에 `series`, `seriesOrder` 필드 추가 |
| 목차 | 긴 글이 많아질 때 | `render()`가 주는 headings로 사이드 목차 생성 |
| 댓글 | 방문자가 생길 때 | giscus (GitHub Discussions 기반) |
| 방문 통계 | 배포 직후 언제든 | Vercel Analytics 또는 Umami |
| 페이지네이션 | 글 30개 이상 | Astro `paginate()` |

### 체크리스트

- [ ] Pagefind 검색
- [ ] 시리즈 필드 및 시리즈 묶음 표시
- [ ] 글 목차
- [ ] giscus 댓글
- [ ] 방문 통계
- [ ] 페이지네이션

---

## 글 작성 템플릿

```md
---
title: "DeepMesh 사이드카 구조 설계"
date: 2026-11-20
tags: ["kubernetes", "security"]
summary: "파드마다 탐지기를 붙이기로 한 이유와 구조"
project: deepmesh
draft: false
---

## 배경

## 접근

## 결과

## 다음에 할 것
```

## 프로젝트 작성 템플릿

```md
---
name: "DeepMesh"
status: "진행 중"
summary: "KD-CNN + OCSVM 기반 파드 단위 침입 탐지 사이드카"
stack: ["Kubernetes", "KD-CNN", "OCSVM"]
startDate: 2025-03   # 시작. 'YYYY-MM'(권장) 또는 'YYYY-MM-DD', 비워 두면 기간 표시 안 함
endDate:             # 끝. 진행 중이면 비워 둠 → '현재'로 표시 (status가 '완료'면 필수)
github: "https://github.com/[아이디]/deepmesh"
paper: "/papers/deepmesh.pdf"
order: 1
featured: true
---
```

기간은 화면에 `진행 중 · 2025.03 – 현재`처럼 월까지 표시됩니다. `2025-3`(자릿수 틀림), `2025-13`, 종료가 시작보다 앞선 값, 시작 없이 종료만 적은 값은 빌드 에러로 알려 줍니다.
