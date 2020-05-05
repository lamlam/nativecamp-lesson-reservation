import puppeteer from 'puppeteer';
import { ScreenshotManager } from './utils/ScreenshotManager';
import { Login } from './pages/Login';
import { Reserve } from './pages/Reserve';

async function initPage(): Promise<puppeteer.Page> {
  const options: puppeteer.LaunchOptions = {
    defaultViewport: {
      width: 1200,
      height: 800,
    },
    slowMo: 100,
  };
  if (process.env.GITHUB_ACTION) {
    // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
    options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
  }
  const browser = await puppeteer.launch(options);
  return browser.newPage();
}

async function login(
  page: puppeteer.Page,
  screenshotManager: ScreenshotManager,
): Promise<puppeteer.Page> {
  const EMAIL = process.env.NC_EMAIL;
  const PASSWORD = process.env.NC_PASSWORD;

  if (!EMAIL || !PASSWORD) {
    throw new Error('Email or Password cannot be null or undefined.');
  }

  const loginPage = new Login(page, screenshotManager);
  return loginPage.login(EMAIL, PASSWORD);
}

function parseTeacherIDs(teacherIDsString: string): Array<number> {
  return teacherIDsString.split(',').map((id) => Number(id));
}

async function reserve(
  page: puppeteer.Page,
  screenshotManager: ScreenshotManager,
): Promise<puppeteer.Page> {
  const TEACHER_IDS = process.env.RESERVE_TEACHER_IDS;
  if (!TEACHER_IDS) {
    throw new Error('teacherID cannot be null or undefined.');
  }
  const teacherIDs = parseTeacherIDs(TEACHER_IDS);
  const reservePage = new Reserve(page, screenshotManager);
  return reservePage.reserve(teacherIDs);
}

(async (): Promise<void> => {
  let page: puppeteer.Page | undefined;
  try {
    const screenshotManager = new ScreenshotManager();
    page = await initPage();
    await login(page, screenshotManager);
    await reserve(page, screenshotManager);
  } catch (e) {
    console.log(e);
    process.exitCode = 1;
  } finally {
    if (page) {
      await page.browser().close();
    }
  }
})();
