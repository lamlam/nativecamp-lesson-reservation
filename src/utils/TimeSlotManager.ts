import dayjs from 'dayjs';
import 'dayjs/locale/ja';

export type TimeSlot = { [key: string]: Array<string> };

export class TimeSlotManager {
  static DAY_OF_WEEK: { [key: string]: string } = {
    sun: '日',
    mon: '月',
    tue: '火',
    wed: '水',
    thu: '木',
    fri: '金',
    sat: '土',
  };

  static DAY_OF_WEEK_BY_NUM: { [key: number]: string } = {
    0: '日',
    1: '月',
    2: '火',
    3: '水',
    4: '木',
    5: '金',
    6: '土',
  };

  static getConvenientTimeSlot(): TimeSlot {
    /*
      example output
      {
        '月': ['08:00', '08:30', '21:00'],
        '火': ['08:00', '08:30', '21:00'],
      }
    */
    const convenientTimeSlot: TimeSlot = {};
    [
      this.DAY_OF_WEEK.mon,
      this.DAY_OF_WEEK.tue,
      this.DAY_OF_WEEK.wed,
      this.DAY_OF_WEEK.thu,
      this.DAY_OF_WEEK.fri,
    ].map((day) => {
      convenientTimeSlot[day] = ['08:00', '08:30', '09:00'];
    });

    dayjs.locale('jp');
    delete convenientTimeSlot[this.DAY_OF_WEEK_BY_NUM[dayjs().day()]];

    if (dayjs().hour() >= 22) {
      delete convenientTimeSlot[
        this.DAY_OF_WEEK_BY_NUM[dayjs().add(1, 'day').day()]
      ];
    }

    return convenientTimeSlot;
  }
}
