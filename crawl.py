from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width":1280, "height":800})
        # 目标页面：选股通精选
        page.goto("https://xuangutong.com.cn/jingxuan", timeout=120000)
        time.sleep(4)

        # 循环向下滚动，触发懒加载，一共滚动5轮，可以自行修改数字
        for i in range(5):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1.8)

        # 获取滚动完成后的完整DOM
        full_html = page.content()
        browser.close()

        # 输出html，放到docs文件夹，用于GitHub Pages发布
        with open("docs/jingxuan_full.html", "w", encoding="utf-8") as f:
            f.write(full_html)
        print("✅抓取完成，已输出 docs/jingxuan_full.html")

if __name__ == "__main__":
    import os
    os.makedirs("docs", exist_ok=True)
    main()
