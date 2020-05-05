import { Page, ElementHandle } from 'puppeteer';
import { ScreenshotManager } from '../utils/ScreenshotManager';
import { Login } from './Login';
import { ReservableAreaHandle } from './ReservableAreaHandle';

export class Reserve {
  static nativecampTopUrl = 'https://nativecamp.net/';

  static SELECTOR: { [key: string]: string } = {
    RESERVABLE_BUTTON: '.btn_style.btn_green.forReservation',
    DOUBLE_BOOKING_BUTTON: '.btn_style.double_booking',
    ALREADY_RSERVED_BUTTON: '.btn_style.reserved.forCancellation',
    RESERVE_MODAL_VISIBLE: '.title.t_truncate',
    RESERVE_SELECT_COURSE_BUTTON:
      '#chooseReservedSchedule.btn_style.btn_green.btnLessonOrReserve',
    RESERVE_ALT_TEACHER_SWITCH: '.nc_ui_checkbox_switch_slider',
    RESERVE_ALT_TEACHER_BUTTON:
      '#chooseReservedSchedule.btn_style.btn_green.close_modal',
    RESERVE_CONFIRM_MODAL: '#dialog_schedule_reserve_confirm',
    RESERVE_CONFIRM_BUTTON:
      '#saveReservedSchedule.btn_style.btn_green.close_modal.btnReservationConfirmed',
    RESERVE_COMPLETE_MODAL: '#dialog_schedule_reserve_complete',
    RESERVE_COMPLETE_MODAL_CLOSE_BUTTON:
      '#dialog_schedule_reserve_complete > .btn_close.close_modal',
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
        const reservableAreaHandle = new ReservableAreaHandle(element);
        const reserveButton = await reservableAreaHandle.findReservableTime();
        if (reserveButton) {
          // reserve
        }
      }
    }
    console.log('Finish to reserve');
    return this.page;
  }
}
