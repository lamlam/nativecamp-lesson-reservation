import puppeteer from 'puppeteer';
import { ScreenshotManager } from './utils/ScreenshotManager';
import { Login } from './pages/Login';

const TEACHER_IDS = process.env.RESERVE_TEACHER_IDS;
const EMAIL = process.env.NC_EMAIL;
const PASSWORD = process.env.NC_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error('Email or Password cannot be null or undefined.');
}

const screenshotManager = new ScreenshotManager();

let browser: puppeteer.Browser | null = null;
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

(async (): Promise<void> => {
  try {
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    const loginPage = new Login(page, screenshotManager);
    await loginPage.login(EMAIL, PASSWORD);
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
