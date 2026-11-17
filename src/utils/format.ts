// 태그 문자열 → URL 조각
// URL에서 특별한 뜻을 갖는 문자(#은 해시, ?는 쿼리, /는 경로)가 남으면 링크가 깨지므로
// 글자·숫자 이외의 문자는 모두 하이픈으로 바꾼다. 흔한 기호는 단어로 바꿔서 정보를 보존한다.
// 결과가 빈 문자열이면(기호로만 된 태그) 그 태그는 페이지와 링크를 만들지 않는다.
export function slugifyTag(tag: string): string {
  return tag
    .trim() // 앞뒤 공백 제거
    .toLowerCase() // 영문 소문자로 (한글은 변화 없음)
    .replace(/\+/g, ' plus ') // c++ → c-plus-plus
    .replace(/#/g, ' sharp ') // c# → c-sharp
    .replace(/&/g, ' and ') // r&d → r-and-d
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-') // 글자·숫자가 아닌 연속 문자 → 하이픈 하나
    .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
}

// 화면 표시용 날짜: "2026년 11월 20일"
const displayFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC', // 날짜만 적은 frontmatter는 UTC 자정이므로 UTC로 읽는다
});

export function formatDate(date: Date): string {
  return displayFormatter.format(date);
}

// <time datetime="...">용 기계 판독 날짜: "2026-11-20"
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// 프로젝트 기간 표시용 월: "2025.03" (UTC 기준이라 빌드 서버 시간대와 무관)
export function formatMonth(date: Date): string {
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

// <time datetime="...">용 월: "2025-03" (HTML이 허용하는 연-월 형식)
export function toISOMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}
