import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // `_`로 시작하는 파일(_template.md 등)은 글로 읽지 않습니다.
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      summary: z.string(),
      draft: z.boolean().default(false),
      // projects 컬렉션의 id (예: 'deepmesh'). 없는 id를 쓰면 빌드 로그에 에러가 납니다.
      project: reference('projects').optional(),
    })
    // 수정일이 작성일보다 앞서면 frontmatter 오타이므로 빌드를 멈춘다.
    .refine((data) => !data.updated || data.updated >= data.date, {
      error: 'updated(수정일)는 date(작성일)와 같거나 이후여야 합니다.',
      path: ['updated'],
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['진행 중', '완료']),
    summary: z.string(),
    stack: z.array(z.string()),
    github: z.url().optional(),
    paper: z.string().optional(), // '/papers/deepmesh.pdf'
    order: z.number(), // 작을수록 앞
    featured: z.boolean().default(false), // 홈에 노출
  }),
});

export const collections = { posts, projects };
