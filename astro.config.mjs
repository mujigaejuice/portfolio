// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  markdown: {
    // 코드 하이라이트: 다크 테마. 배경은 styles/prose.css에서 --surface로 맞춘다.
    shikiConfig: { theme: 'github-dark' },
  },
});
