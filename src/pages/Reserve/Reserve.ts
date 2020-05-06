import { Page } from 'puppeteer';
import { ScreenshotManager } from '../../utils/ScreenshotManager';
import { Login } from '../Login';
import { ReservableAreaHandle } from './ReservableAreaHandle';
import { ReserveModalHandle } from './ReserveModalHandle';

export class Reserve {
  static nativecampTopUrl = 'https://nativecamp.net/';

  static SELECTOR: { [key: string]: string } = {
    RESERVABLE_AREA: 'tr.free_reservable_area',
  };

  page: Page;
  screenshotManager: ScreenshotManager;

  constructor(page: Page, screenshotManager: ScreenshotManager) {
    this.page = page;
    this.screenshotManager = screenshotManager;
  }

  private takeScreenshot(): Promise<Page> {
    return this.screenshotManager.take(this.page);
  }

  private async openTeacherPageUrl(teacherID: number): Promise<Page> {
    const teacherPageUrl = `${Reserve.nativecampTopUrl}waiting/detail/${teacherID}`;
    await this.page.goto(teacherPageUrl);
    return this.page;
  }

  async reserve(teacherIDs: Array<number>): Promise<Page> {
    console.log('Start to reserve');
    const isLoggedIn = await Login.isLoggedIn(this.page);
    if (!isLoggedIn) {
      throw new Error('need login before start reservation');
    }

    for (const teacherID of teacherIDs) {
      await this.openTeacherPageUrl(teacherID);
      await this.takeScreenshot();
      const reservableAreas = await this.page.$$(
        Reserve.SELECTOR.RESERVABLE_AREA,
      );
      for (const element of reservableAreas) {
        try {
          const reservableAreaHandle = new ReservableAreaHandle(
            this.page,
            element,
          );
          const reserveButton = await reservableAreaHandle.findReservableTime();
          if (reserveButton) {
            const reserveModalHandle = new ReserveModalHandle(this.page);
            await reserveModalHandle.reserve(reserveButton);
          }
        } catch (e) {
          await this.takeScreenshot();
          console.log(
            'Failed reserved by some error. Try to reserve other day.',
          );
        }
      }
    }
    console.log('Finish to reserve');
    return this.page;
  }
}
