const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 打开本地打包好的静态页面文件，file协议
  const localHtmlPath = path.resolve('./dist/jingxuan_full.html');
  await page.goto(`file://${localHtmlPath}`, { waitUntil: 'networkidle', timeout: 60000 });

  // ==========在这里写你的页面交互逻辑，触发全部动态渲染==========
  // 1.滚动页面到底部，触发无限滚动加载更多数据
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  // 2.示例：点击Tab切换，渲染其他标签页内容，修改选择器适配你页面
  // await page.click('[data-tab="longhu"]');
  // await page.waitForTimeout(2000);

  // 等待所有网络请求、组件渲染完毕
  await page.waitForLoadState('networkidle');

  // 抓取浏览器运行时完整DOM（等价于Elements面板复制outerHTML）
  const fullDomHtml = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  // 将完整DOM写入dist输出目录，随gh‑pages一起发布
  fs.writeFileSync(path.resolve('./dist/full_dom.html'), fullDomHtml, 'utf‑8');
  console.log("✅ 完整运行时DOM已输出 dist/full_dom.html");

  await browser.close();
})();
