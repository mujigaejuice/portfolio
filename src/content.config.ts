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
      // 시리즈 이름(같은 이름끼리 묶임)과 시리즈 안에서의 순서(1, 2, 3...).
      // seriesOrder를 생략하면 같은 시리즈 안에서 작성일 순으로 놓인다.
      series: z.string().trim().min(1).optional(),
      seriesOrder: z.number().int().positive().optional(),
    })
    // 수정일이 작성일보다 앞서면 frontmatter 오타이므로 빌드를 멈춘다.
    .refine((data) => !data.updated || data.updated >= data.date, {
      error: 'updated(수정일)는 date(작성일)와 같거나 이후여야 합니다.',
      path: ['updated'],
    })
    .refine((data) => data.seriesOrder === undefined || data.series !== undefined, {
      error: 'seriesOrder를 쓰려면 series(시리즈 이름)도 적어야 합니다.',
      path: ['series'],
    }),
});

// 프로젝트 기간의 날짜 한 칸 (startDate, endDate).
// - 'YYYY-MM'(권장, 월까지) 또는 'YYYY-MM-DD'로 적는다. 화면에는 월까지 표시한다.
// - 비워 두면(`startDate:`) 아직 입력하지 않은 것으로 보고 화면에 기간을 표시하지 않는다.
// - 형식을 엄격하게 검사하는 이유: '2025-3'은 한국 시간 기준으로 해석되어 UTC로 2월 28일이 되고,
//   '2025-02-30'은 3월 2일로 넘어간다. 둘 다 에러 없이 틀린 달이 표시되는 문제를 막는다.
//   (따옴표 없는 YYYY-MM-DD는 YAML이 먼저 Date로 바꿔서 주므로 존재하지 않는 날짜까지는 잡지 못한다.)
const PROJECT_DATE_FORMAT = /^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/;
const projectDate = z.preprocess(
  (value) => {
    if (value === null || value === '') return undefined; // 빈 칸
    if (value instanceof Date) return value.toISOString().slice(0, 10); // YAML이 바꾼 Date → 'YYYY-MM-DD'
    return value;
  },
  z
    .string()
    .regex(PROJECT_DATE_FORMAT, {
      error: "날짜는 'YYYY-MM' 또는 'YYYY-MM-DD' 형식으로 적습니다. (예: 2025-03)",
      abort: true, // 형식이 틀리면 아래 날짜 검사는 건너뛴다(메시지 중복 방지)
    })
    .refine(
      (value) => {
        const iso = value.length === 7 ? `${value}-01` : value;
        const date = new Date(iso);
        return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(iso);
      },
      { error: '존재하지 않는 날짜입니다.' },
    )
    .transform((value) => new Date(value.length === 7 ? `${value}-01` : value)) // UTC 자정
    .optional(),
);

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z
    .object({
      name: z.string(),
      status: z.enum(['진행 중', '완료']).optional(), // 비워 두면 상태를 표시하지 않음
      summary: z.string(),
      stack: z.array(z.string()).default([]), // 비워 두면 스택을 표시하지 않음
      startDate: projectDate, // 시작 (예: 2025-03)
      endDate: projectDate, // 끝. 진행 중이면 비워 둔다 → 화면에 '현재'로 표시
      github: z.url().optional(),
      paper: z.string().optional(), // '/papers/deepmesh.pdf'
      order: z.number(), // 작을수록 앞
      featured: z.boolean().default(false), // 홈에 노출
    })
    .refine((data) => !data.endDate || data.startDate, {
      error: 'endDate(종료)를 적으려면 startDate(시작)도 적어야 합니다.',
      path: ['startDate'],
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
      error: 'endDate(종료)는 startDate(시작)와 같거나 이후여야 합니다.',
      path: ['endDate'],
    })
    .refine((data) => !(data.status === '완료' && data.startDate && !data.endDate), {
      error: "status가 '완료'인 프로젝트는 endDate(종료)도 적습니다.",
      path: ['endDate'],
    }),
});

export const collections = { posts, projects };
