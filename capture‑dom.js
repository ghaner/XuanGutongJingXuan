const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  // 启动浏览器，关闭CORS限制，规避file://跨域API请求问题
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 读取nuxt generate输出的本地静态html
  const targetHtml = path.resolve('./dist/jingxuan_full.html');
  const fileUrl = `file://${targetHtml}`;

  console.log('打开本地文件：', fileUrl);

  // 加载页面，等待网络空闲，总超时60秒
  await page.goto(fileUrl, {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // 1.滚动到底部，触发无限滚动加载列表数据
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 4000));
  });

  // 可按需打开：切换tab示例，替换为你页面真实tab选择器
  // await page.click('[role="tab"][data-key="longhu"]');
  // await page.waitForTimeout(3000);

  // 再次等待所有网络请求结束
  await page.waitForLoadState('networkidle', { timeout: 60000 });

  // 提取浏览器运行时完整DOM，等价于Elements面板复制outerHTML
  const fullOuterHtml = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  // 写入dist目录，随gh‑pages发布
  const outputPath = path.resolve('./dist/full_dom.html');
  fs.writeFileSync(outputPath, fullOuterHtml, 'utf-8');

  console.log('✅完整DOM已输出 -> dist/full_dom.html');
  console.log('文件字节大小:', Buffer.byteLength(fullOuterHtml, 'utf-8'));

  await browser.close();
})();
