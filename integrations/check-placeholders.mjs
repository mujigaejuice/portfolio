// 빌드 결과(dist)에 자리표시자가 남아 있는지 검사하는 Astro integration.
//
// - 로컬 빌드: 남아 있는 자리표시자를 경고로 보여 주기만 한다(작업 중에는 자리표시자가 있는 게 정상).
// - Vercel / CI 빌드(환경 변수 VERCEL 또는 CI가 있을 때): 하나라도 남아 있으면 빌드를 실패시킨다.
//   '[블로그 이름]' 같은 값이나 site의 임시 주소(example.com)가 실제 사이트에 배포되는 것을 막는다.
//
// 검사 대상은 이 프로젝트에서 실제로 쓰는 자리표시자 목록이다. 새로 자리표시자를 만들면 여기에도 추가한다.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER_PATTERNS = [
  /\[(?:블로그 이름|이름|아이디|이메일|한 줄 소개|한두 줄 요약|스택\d+)\]/g,
  /\[문제 → 접근 → 결과[^\]]*\]/g,
  /hello@example\.com/g,
  /https?:\/\/example\.com/g,
];
const SCANNED_EXTENSIONS = ['.html', '.xml', '.txt'];

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && SCANNED_EXTENSIONS.some((ext) => entry.name.endsWith(ext)))
    .map((entry) => join(entry.parentPath, entry.name));
}

/** @returns {import('astro').AstroIntegration} */
export default function checkPlaceholders() {
  return {
    name: 'check-placeholders',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const found = new Map(); // 자리표시자 → 나온 파일 목록

        for (const file of await listFiles(root)) {
          const text = await readFile(file, 'utf8');
          for (const pattern of PLACEHOLDER_PATTERNS) {
            for (const match of text.matchAll(pattern)) {
              const files = found.get(match[0]) ?? new Set();
              files.add(relative(root, file).replaceAll('\\', '/'));
              found.set(match[0], files);
            }
          }
        }

        if (found.size === 0) {
          logger.info('자리표시자 없음');
          return;
        }

        const lines = [...found].map(([value, files]) => {
          const list = [...files];
          const shown = list.slice(0, 3).join(', ') + (list.length > 3 ? ` 외 ${list.length - 3}개` : '');
          return `  ${value}  (${shown})`;
        });
        const message = `남아 있는 자리표시자 ${found.size}종:\n${lines.join('\n')}`;

        if (process.env.VERCEL || process.env.CI) {
          throw new Error(`${message}\n배포 빌드에서는 자리표시자를 모두 실제 값으로 바꿔야 합니다.`);
        }
        logger.warn(`${message}\n(로컬 빌드라서 경고만 합니다. Vercel/CI 빌드에서는 실패합니다.)`);
      },
    },
  };
}
