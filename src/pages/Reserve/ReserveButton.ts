import { ElementHandle, Page } from 'puppeteer';
export class ReserveButton {
  private RESERVE_MODAL_VISIBLE_SELECTER = '.title.t_truncate';
  private reserveButton: ElementHandle;
  private page: Page;
  private time: string;

  constructor(page: Page, reserveButton: ElementHandle, time: string) {
    this.reserveButton = reserveButton;
    this.page = page;
    this.time = time;
  }

  getTime(): string {
    return this.time;
  }

  async click(): Promise<void> {
    await Promise.all([
      this.page.waitForSelector(this.RESERVE_MODAL_VISIBLE_SELECTER),
      this.reserveButton.click(),
    ]);
  }
}
