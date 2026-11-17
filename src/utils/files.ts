import { existsSync } from 'node:fs';
import { join } from 'node:path';

// public/ 폴더에 파일이 실제로 있는지 빌드 시점에 확인합니다.
// 이력서·논문 PDF처럼 "파일이 생기면 링크를 보이고, 없으면 숨기는" 곳에 씁니다.
// urlPath는 사이트 주소 기준 경로입니다. 예: '/resume.pdf' → public/resume.pdf
// (외부 URL(https://...)은 확인할 수 없으므로 항상 true)
export function publicFileExists(urlPath: string): boolean {
  if (/^https?:\/\//.test(urlPath)) return true;
  return existsSync(join(process.cwd(), 'public', urlPath));
}
