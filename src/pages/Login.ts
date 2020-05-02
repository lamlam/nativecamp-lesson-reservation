import { Page } from 'puppeteer';
import { ScreenshotManager } from '../utils/ScreenshotManager';

export class Login {
  static PAGE_URL = 'https://nativecamp.net/login';
  static SELECTOR_INPUT_EMAIL = 'input[name="data[User][email]"]';
  static SELECTOR_INPUT_PASSWORD = 'input[name="data[User][password]"]';
  static SELECTOR_SUBMIT = 'button[type="submit"]';

  page: Page;
  screenshotManager: ScreenshotManager;

  constructor(page: Page, screenshotManager: ScreenshotManager) {
    this.page = page;
    this.screenshotManager = screenshotManager;
  }

  private takeScreenshot(): Promise<Page> {
    return this.screenshotManager.take(this.page);
  }

  async login(email: string, password: string): Promise<Page> {
    await this.page.goto(Login.PAGE_URL);
    await this.takeScreenshot();

    await this.page.type(Login.SELECTOR_INPUT_EMAIL, email);
    await this.page.type(Login.SELECTOR_INPUT_PASSWORD, password);

    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click(Login.SELECTOR_SUBMIT),
    ]);
    await this.takeScreenshot();

    return this.page;
  }
}
