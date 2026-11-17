// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import checkPlaceholders from './integrations/check-placeholders.mjs';

// 글 본문의 첫 번째 이미지만 loading="eager" + fetchpriority="high"로 바꾼다.
// Astro는 Markdown 이미지에 loading="lazy"를 붙이는데, 화면 위쪽의 큰 이미지가 LCP 요소가 되면
// 지연 로딩 때문에 첫 화면 표시가 늦어진다(Lighthouse "LCP request should not be lazy loaded").
// 두 번째 이후 이미지는 기본값(lazy)을 유지해서 불필요한 다운로드를 막는다.
/** @type {import('satteri').HastPluginDefinition} */
const eagerFirstImage = {
  name: 'eager-first-image',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      // ctx.data는 글(문서) 하나마다 새로 만들어지므로 "문서의 첫 이미지"를 구분할 수 있다.
      const data = /** @type {Record<string, any>} */ (ctx.data.astro);
      if (data.firstImageHandled) return;
      data.firstImageHandled = true;
      // Astro 이미지 옵션 priority: loading="eager" + decoding="sync" + fetchpriority="high"를 한 번에 적용한다.
      // (폰트가 먼저 대역폭을 차지해서 이미지가 뒤로 밀리지 않게 우선순위도 올린다.)
      ctx.setProperty(node, 'priority', true);
    },
  },
};

// GFM 체크리스트(- [ ] / - [x])가 만드는 <input type="checkbox">에는 <label>이 없어서
// 스크린 리더가 "체크박스"라고만 읽고, Lighthouse 접근성 검사(label)에도 걸린다.
// 항목의 글자를 aria-label로 붙여 준다. 빌드 시점에 처리하므로 브라우저 JS는 필요 없다.

/**
 * 하위 목록(ul/ol)을 뺀 글자만 모은다. 중첩 체크리스트에서 부모 항목 라벨에 자식 글자가 섞이지 않게.
 * @param {any} node hast 노드
 * @returns {string}
 */
function textWithoutSublists(node) {
  if (node.type === 'text') return node.value ?? '';
  if (node.type === 'element' && (node.tagName === 'ul' || node.tagName === 'ol')) return '';
  return (node.children ?? []).map(textWithoutSublists).join('');
}

/** @param {any} node @param {string} tagName */
const isElement = (node, tagName) => node?.type === 'element' && node.tagName === tagName;

/** @type {import('satteri').HastPluginDefinition} */
const labelTaskCheckboxes = {
  name: 'label-task-checkboxes',
  element: {
    filter: ['li'],
    visit(node, ctx) {
      /** @type {any[]} */
      const children = node.children ?? [];
      // 촘촘한 목록: <li><input> 글자</li>
      // 느슨한 목록(항목 사이 빈 줄): <li><p><input> 글자</p></li>
      const firstParagraph = children.find((child) => isElement(child, 'p'));
      const input =
        children.find((child) => isElement(child, 'input')) ??
        firstParagraph?.children?.find((/** @type {any} */ child) => isElement(child, 'input'));
      if (!input) return;
      const text = textWithoutSublists(node).replace(/\s+/g, ' ').trim();
      if (text) ctx.setProperty(input, 'ariaLabel', text);
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // 배포 주소. 사이트맵·RSS·canonical·OG 이미지·robots.txt의 절대 URL이 모두 이 값으로 만들어집니다.
  // Vercel 빌드에서는 시스템 환경 변수 VERCEL_PROJECT_PRODUCTION_URL(프로토콜 없는 도메인, 커스텀 도메인이
  // 있으면 그중 가장 짧은 것)을 쓰고, 로컬 빌드에서는 임시값을 쓴다. 임시값이 배포 빌드에 남으면
  // integrations/check-placeholders.mjs가 빌드를 실패시킨다.
  // Vercel이 아닌 곳에 배포하면 아래 임시값을 실제 주소로 바꾼다.
  site: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://example.com',
  // 페이지 주소는 항상 끝 슬래시(/posts/abc/). canonical·RSS·사이트맵과 같은 형태로 통일한다.
  // 내부 링크는 src/utils/urls.ts의 함수로 만든다.
  trailingSlash: 'always',
  integrations: [sitemap(), checkPlaceholders()],
  markdown: {
    processor: satteri({ hastPlugins: [eagerFirstImage, labelTaskCheckboxes] }),
    // 코드 하이라이트: 다크 테마. 배경은 styles/prose.css에서 --surface로 맞춘다.
    shikiConfig: { theme: 'github-dark' },
  },
});
