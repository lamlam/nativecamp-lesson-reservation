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

  static getPreferableTimeSlot(): { [key: string]: Array<string> } {
    /*
      example output
      {
        '月': ['08:00', '08:30', '21:00'],
        '火': ['08:00', '08:30', '21:00'],
      }
    */
    const preferableTimeSlot: { [key: string]: Array<string> } = {};
    [
      TimeSlotManager.DAY_OF_WEEK.mon,
      TimeSlotManager.DAY_OF_WEEK.tue,
      TimeSlotManager.DAY_OF_WEEK.wed,
      TimeSlotManager.DAY_OF_WEEK.thu,
      TimeSlotManager.DAY_OF_WEEK.fri,
    ].map((day) => {
      preferableTimeSlot[day] = ['08:00', '08:30', '09:00'];
    });
    return preferableTimeSlot;
  }
}
