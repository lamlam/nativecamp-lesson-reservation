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
  await screenshotWithId(page);

  await Promise.all([
    page.waitForNavigation(),
    await page.click('button[type="submit"]'),
  ]);
  await screenshotWithId(page);
}

async function reserve(page, teacherID) {
  if (!page) {
    throw new Error('page cannot be null or undefined.');
  }
  if (!teacherID) {
    throw new Error('teacherID cannot be null or undefined.');
  }

  await page.goto(getTeacherPageUrl(teacherID));
  await screenshotWithId(page);

  const elements = await page.$$('tr[class="free_reservable_area"');
  for (const element of elements) {
    await screenshotWithId(element);
  }
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

    await login(page, EMAIL, PASSWORD);

    const teacherIDs = TEACHER_IDS.split(',');
    for (const teacherID of teacherIDs) {
      await reserve(page, teacherID);
    }
  } catch (e) {
    console.log(e);
  } finally {
    if (browser) {
      // puppeteerを終了します
      await browser.close();
    }
  }
})();
