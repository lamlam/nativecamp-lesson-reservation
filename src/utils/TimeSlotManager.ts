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
      TimeSlotManager.DAY_OF_WEEK.mon,
      TimeSlotManager.DAY_OF_WEEK.tue,
      TimeSlotManager.DAY_OF_WEEK.wed,
      TimeSlotManager.DAY_OF_WEEK.thu,
      TimeSlotManager.DAY_OF_WEEK.fri,
    ].map((day) => {
      convenientTimeSlot[day] = ['08:00', '08:30', '09:00'];
    });
    return convenientTimeSlot;
  }
}
