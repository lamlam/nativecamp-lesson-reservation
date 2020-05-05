import { ElementHandle } from 'puppeteer';
import { TimeSlotManager, TimeSlot } from '../utils/TimeSlotManager';

export class ReservableAreaHandle {
  private element: ElementHandle;
  private day: string;

  private SELECTOR: { [key: string]: string } = {
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

  constructor(reservableAreaElement: ElementHandle) {
    this.element = reservableAreaElement;
    this.day = '';
  }

  private async setDay(): Promise<string> {
    this.day = await this.element.$eval('.day', (node) =>
      (node as HTMLElement).innerText.substring(1, 2),
    );
    return this.day;
  }

  private async isConvenientDay(timeSlot: TimeSlot): Promise<boolean> {
    if (!Object.prototype.hasOwnProperty.call(timeSlot, this.day)) {
      console.log(`${this.day} is not convenient day`);
      return false;
    }
    return true;
  }

  private async isDoubleBookingDay(): Promise<boolean> {
    const doubleBookingElement = await this.element.$(
      this.SELECTOR.DOUBLE_BOOKING_BUTTON_SELECTER,
    );
    if (doubleBookingElement) {
      console.log(`${this.day} has double booking`);
      return true;
    }
    return false;
  }

  private async isReservedDay(): Promise<boolean> {
    const alreadyRservedElement = await this.element.$(
      this.SELECTOR.ALREADY_RSERVED_BUTTON_SELECTER,
    );
    if (alreadyRservedElement) {
      console.log(`${this.day} has already reserved`);
      return true;
    }
    return false;
  }

  private async findReservableTimeFromTimeSlot(
    timeSlot: TimeSlot,
  ): Promise<ElementHandle | null> {
    const reserveButtons = await this.element.$$(
      this.SELECTOR.RESERVABLE_BUTTON_SELECTER,
    );
    if (reserveButtons.length === 0) {
      console.log(`Reservable time not found in ${this.day}`);
      return null;
    }

    for (const reserveButton of reserveButtons) {
      try {
        const time = await this.element.evaluate(
          (node) => (node as HTMLElement).innerText,
          reserveButton,
        );
        if (timeSlot[this.day].indexOf(time) === -1) {
          continue;
        }
        return reserveButton;
      } catch (e) {
        console.log(e);
        continue;
      }
    }

    console.log(`Convenient time slot not found in ${this.day}`);
    return null;
  }

  async findReservableTime(): Promise<ElementHandle | null> {
    await this.setDay();
    const timeSlot = TimeSlotManager.getConvenientTimeSlot();
    if (
      !(await this.isConvenientDay(timeSlot)) ||
      (await this.isDoubleBookingDay()) ||
      (await this.isReservedDay())
    ) {
      return null;
    }
    return this.findReservableTimeFromTimeSlot(timeSlot);
  }
}
