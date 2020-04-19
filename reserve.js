const puppeteer = require('puppeteer');

const nativecampTopUrl = 'https://nativecamp.net/';
const nativecampLoginUrl = 'https://nativecamp.net/login';

const TEACHER_IDS = process.env.RESERVE_TEACHER_IDS;
const EMAIL = process.env.NC_EMAIL;
const PASSWORD = process.env.NC_PASSWORD;

function getTeacherPageUrl(teacherID) {
  if (!teacherID) {
    throw new Error('teacherID cannot be null or undefined.');
  }
  return `${nativecampTopUrl}waiting/detail/${teacherID}`;
}

let screenshotId = 0;
async function screenshotWithId(page, baseName = 'screenshots/screenshot') {
  const screenshotIdString = String(screenshotId).padStart(3, '0');
  await page.screenshot({ path: `${baseName}${screenshotIdString}.png` });
  screenshotId += 1;
}

async function login(page, email, password) {
  if (!page) {
    throw new Error('page cannot be null or undefined.');
  }
  if (!email || !password) {
    throw new Error('Email or Password cannot be null or undefined.');
  }

  await page.goto(nativecampLoginUrl);
  await screenshotWithId(page);

  await page.type('input[name="data[User][email]"', EMAIL);
  await page.type('input[name="data[User][password]"', PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    await page.click('button[type="submit"]'),
  ]);
  await screenshotWithId(page);
  return true;
}

async function reserve(page, teacherID, isLoggedIn = false) {
  if (!page) {
    throw new Error('page cannot be null or undefined.');
  }
  if (!teacherID) {
    throw new Error('teacherID cannot be null or undefined.');
  }
  if (!isLoggedIn) {
    throw new Error('need login before start reservation');
  }

  await page.goto(getTeacherPageUrl(teacherID));
  await screenshotWithId(page);

  const elements = await page.$$('tr[class="free_reservable_area"');
  for (const element of elements) {
    await screenshotWithId(element);
  }
}

(async () => {
  let options = {
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  };
  if (process.env.CI) {
    // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
    options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
    // https://github.com/ianwalter/puppeteer
    options.executablePath = 'google-chrome-stable';
  }
  try {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    const isLoggedIn = await login(page, EMAIL, PASSWORD);

    const teacherIDs = TEACHER_IDS.split(',');
    for (const teacherID of teacherIDs) {
      await reserve(page, teacherID, isLoggedIn);
    }
  } catch (e) {
    console.log(e);
    process.exitCode = 1;
  } finally {
    if (browser) {
      // puppeteerを終了します
      await browser.close();
    }
  }
})();
