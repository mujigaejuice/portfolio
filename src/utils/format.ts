// 태그 문자열 → URL 조각
export function slugifyTag(tag: string): string {
  return tag
    .trim() // 앞뒤 공백 제거
    .toLowerCase() // 영문 소문자로 (한글은 변화 없음)
    .replace(/[\s/]+/g, '-') // 공백·슬래시 연속 → 하이픈 하나
    .replace(/-+/g, '-') // 하이픈 여러 개 → 하나
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
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
