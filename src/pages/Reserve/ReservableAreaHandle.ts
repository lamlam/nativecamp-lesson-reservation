import { ElementHandle, Page } from 'puppeteer';
import { TimeSlotManager, TimeSlot } from '../../utils/TimeSlotManager';
import { ReserveButton } from './ReserveButton';

export class ReservableAreaHandle {
  private element: ElementHandle;
  private day: string;
  private page: Page;

  private SELECTOR: { [key: string]: string } = {
    RESERVABLE_BUTTON: '.btn_style.btn_green.forReservation',
    DOUBLE_BOOKING_BUTTON: '.btn_style.double_booking',
    ALREADY_RSERVED_BUTTON: '.btn_style.reserved.forCancellation',
  };

  constructor(page: Page, reservableAreaElement: ElementHandle) {
    this.element = reservableAreaElement;
    this.day = '';
    this.page = page;
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
      this.SELECTOR.DOUBLE_BOOKING_BUTTON,
    );
    if (doubleBookingElement) {
      console.log(`${this.day} has double booking`);
      return true;
    }
    return false;
  }

  private async isReservedDay(): Promise<boolean> {
    const alreadyRservedElement = await this.element.$(
      this.SELECTOR.ALREADY_RSERVED_BUTTON,
    );
    if (alreadyRservedElement) {
      console.log(`${this.day} has already reserved`);
      return true;
    }
    return false;
  }

  private async findReservableTimeFromTimeSlot(
    timeSlot: TimeSlot,
  ): Promise<ReserveButton | null> {
    const reserveButtons = await this.element.$$(
      this.SELECTOR.RESERVABLE_BUTTON,
    );
    if (reserveButtons.length === 0) {
      console.log(`Reservable time not found in ${this.day}`);
      return null;
    }

    for (const reserveButton of reserveButtons) {
      try {
        const time = await this.page.evaluate(
          (node) => (node as HTMLElement).innerText,
          reserveButton,
        );
        if (timeSlot[this.day].indexOf(time) === -1) {
          continue;
        }
        return new ReserveButton(this.page, reserveButton, time);
      } catch (e) {
        console.log(e);
        continue;
      }
    }

    console.log(`Convenient time slot not found in ${this.day}`);
    return null;
  }

  async findReservableTime(): Promise<ReserveButton | null> {
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
