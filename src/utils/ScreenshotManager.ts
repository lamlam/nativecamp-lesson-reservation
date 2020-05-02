import { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

export class ScreenshotManager {
  screenshotId: number;
  fileBaseName: string;

  constructor(fileBaseName = 'screenshots/screenshot') {
    this.screenshotId = 0;
    this.fileBaseName = fileBaseName;
    ScreenshotManager.createDirIfNotExist(fileBaseName);
  }

  static createDirIfNotExist(fileBaseName: string): void {
    const pathName = path.dirname(fileBaseName);
    if (!fs.existsSync(pathName)) {
      fs.mkdirSync(pathName, { recursive: true });
    }
  }

  async take(page: Page): Promise<Page> {
    const screenshotIdString = String(this.screenshotId).padStart(3, '0');
    await page.screenshot({
      path: `${this.fileBaseName}${screenshotIdString}.png`,
    });
    this.screenshotId += 1;
    return page;
  }
}
