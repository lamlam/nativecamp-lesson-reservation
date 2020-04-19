const puppeteer = require('puppeteer');

const nativecampTopUrl = 'https://nativecamp.net/';
const nativecampLoginUrl = 'https://nativecamp.net/login';

const teacherId = 3306;

function getTeacherPageUrl(teacherId) {
  if (!teacherId) {
    throw Error('Teacher Id cannot be undefined');
  }
  return `${nativecampTopUrl}waiting/detail/${teacherId}`;
}

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
    await page.goto(nativecampLoginUrl);
    await screenshotWithId(page);

    /*
    await page.goto(getTeacherPageUrl(teacherId));
    // スクリーンショットを取ります
    await screenshotWithId(page);

    // ログインをクリック
    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('a[href=""]'),
    ]);
    // スクリーンショットを取ります
    await screenshotWithId(page);
    */
  } catch (e) {
    console.log(e);
  } finally {
    if (browser) {
      // puppeteerを終了します
      await browser.close();
    }
  }
})();
