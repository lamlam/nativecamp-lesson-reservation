import { Page, ElementHandle } from 'puppeteer';
import { ReserveButton } from './ReserveButton';

// Order of reserve modal view
const State = {
  ModalClosed: 0,
  SelectCourse: 1,
  SettingAltTeacher: 2,
  Confirm: 3,
  Complete: 4,
} as const;
type State = typeof State[keyof typeof State];

export class ReserveModalHandle {
  private page: Page;
  private state: State;

  private SELECTOR: { [key: string]: string } = {
    SELECT_COURSE_BUTTON:
      '#chooseReservedSchedule.btn_style.btn_green.btnLessonOrReserve',
    ALT_TEACHER_SWITCH: '.nc_ui_checkbox_switch_slider',
    SET_ALT_TEACHER_BUTTON:
      '#chooseReservedSchedule.btn_style.btn_green.close_modal',
    CONFIRM_MODAL: '#dialog_schedule_reserve_confirm',
    CONFIRM_BUTTON:
      '#saveReservedSchedule.btn_style.btn_green.close_modal.btnReservationConfirmed',
    COMPLETE_MODAL: '#dialog_schedule_reserve_complete',
    COMPLETE_MODAL_CLOSE_BUTTON:
      '#dialog_schedule_reserve_complete > .btn_close.close_modal',
    COURSE_NAME: '.title.t_truncate',
  };

  constructor(page: Page) {
    this.page = page;
    this.state = State.ModalClosed;
  }

  private async openReserveModal(reserveButton: ReserveButton): Promise<void> {
    if (this.state !== State.ModalClosed) {
      throw new Error('Modal should be closed');
    }
    const time = reserveButton.getTime();
    console.log(`Try to reserve at ${time}`);
    await reserveButton.click();
    this.state = State.SelectCourse;
  }

  private async getSelectedCource(): Promise<string> {
    if (this.state === State.SelectCourse) {
      const course = await this.page.$eval(
        this.SELECTOR.COURSE_NAME,
        (node) => (node as HTMLElement).innerText,
      );
      return course;
    }
    return '';
  }

  private async selectCource(): Promise<void> {
    if (this.state !== State.SelectCourse) {
      throw new Error('Modal should be selecting course view');
    }

    const course = await this.getSelectedCource();
    if (!course.includes('カランコース')) {
      console.log('カラン is not selected');
    }

    const selectCourseButton = await this.page.$(
      this.SELECTOR.SELECT_COURSE_BUTTON,
    );
    if (!selectCourseButton) {
      throw new Error('Selecting course button is not found');
    }
    await Promise.all([
      this.page.waitForSelector(this.SELECTOR.ALT_TEACHER_SWITCH),
      selectCourseButton.click(),
    ]);

    this.state = State.SettingAltTeacher;
  }

  private async setAltTeacher(): Promise<void> {
    if (this.state !== State.SettingAltTeacher) {
      throw new Error('Modal should be setting alt teacher view');
    }

    const altTeacherSwitch = await this.page.$(
      this.SELECTOR.ALT_TEACHER_SWITCH,
    );
    if (!altTeacherSwitch) {
      throw new Error('Alt teacher switch is not found');
    }
    await altTeacherSwitch.click();

    const setAltTeacherButton = await this.page.$(
      this.SELECTOR.SET_ALT_TEACHER_BUTTON,
    );
    if (!setAltTeacherButton) {
      throw new Error('Set alt teacher button is not found');
    }
    await Promise.all([
      this.page.waitForSelector(this.SELECTOR.CONFIRM_MODAL, {
        visible: true,
      }),
      setAltTeacherButton.click(),
    ]);

    this.state = State.Confirm;
  }

  private async confirm(): Promise<void> {
    if (this.state !== State.Confirm) {
      throw new Error('Modal should be confirm view');
    }

    const reserveConfirmButton = await this.page.$(
      this.SELECTOR.CONFIRM_BUTTON,
    );
    if (!reserveConfirmButton) {
      throw new Error('Confirm button is not found');
    }

    await Promise.all([
      this.page.waitForSelector(this.SELECTOR.COMPLETE_MODAL, {
        visible: true,
      }),
      reserveConfirmButton.click(),
    ]);

    this.state = State.Complete;
  }

  private async complete(): Promise<void> {
    if (this.state !== State.Complete) {
      throw new Error('Modal should be complete view');
    }

    const closeModalButton = await this.page.$(
      this.SELECTOR.COMPLETE_MODAL_CLOSE_BUTTON,
    );
    if (!closeModalButton) {
      throw new Error('Close modal button is not found');
    }
    await Promise.all([
      this.page.waitForSelector(this.SELECTOR.COMPLETE_MODAL, {
        hidden: true,
      }),
      closeModalButton.click(),
    ]);

    this.state = State.ModalClosed;
    console.log('Succeed reservation');
    process.env.RESERVED = 'true';
  }

  async reserve(reserveButton: ReserveButton): Promise<void> {
    await this.openReserveModal(reserveButton);
    await this.selectCource();
    await this.setAltTeacher();
    await this.confirm();
    await this.complete();
  }
}
