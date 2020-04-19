const puppeteer = require('puppeteer');

let screenshotId = 0;
async function screenshotWithId(page, baseName = 'screenshots/screenshot') {
  const screenshotIdString = String(screenshotId).padStart(3, '0');
  await page.screenshot({ path: `${baseName}${screenshotIdString}.png` });
  screenshotId += 1;
}

(async () => {
  // puppeteerを立ち上げます
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  });

  try {
    const page = await browser.newPage();
    // pageを目的のURLへ移動します
    await page.goto('https://nativecamp.net/waiting/detail/3306');
    // スクリーンショットを取ります
    await screenshotWithId(page);

    // ログインをクリック
    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('a[href="https://nativecamp.net/login"]'),
    ]);
    // スクリーンショットを取ります
    await screenshotWithId(page);
  } catch (e) {
    console.log(e);
  } finally {
    if (browser) {
      // puppeteerを終了します
      await browser.close();
    }
  }
})();
