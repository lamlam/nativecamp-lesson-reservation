import { TimeSlotManager } from '../TimeSlotManager';

describe('TimeSLotManager', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
  });

  test('When it is 21:59 JST, do not remove next day from convenient time slot', () => {
    jest.setSystemTime(new Date('Wed, 26 Aug 2020 21:59:00 +0900'));
    const actual = TimeSlotManager.getConvenientTimeSlot();
    const expectTimeSlot = {
      月: ['08:00', '08:30', '09:00'],
      木: ['08:00', '08:30', '09:00'],
      水: ['08:00', '08:30', '09:00'],
      火: ['08:00', '08:30', '09:00'],
      金: ['08:00', '08:30', '09:00'],
    };
    expect(actual).toEqual(expectTimeSlot);
  });

  test('When it is 22:00 JST, remove next day from convenient time slot', () => {
    jest.setSystemTime(new Date('Wed, 26 Aug 2020 22:00:00 +0900'));
    const actual = TimeSlotManager.getConvenientTimeSlot();
    const expectTimeSlot = {
      月: ['08:00', '08:30', '09:00'],
      水: ['08:00', '08:30', '09:00'],
      火: ['08:00', '08:30', '09:00'],
      金: ['08:00', '08:30', '09:00'],
    };
    expect(actual).toEqual(expectTimeSlot);
  });

  test('When it is 0:00 JST, remove today from convenient time slot', () => {
    jest.setSystemTime(new Date('Thu, 27 Aug 2020 00:00:00 +0900'));
    const actual = TimeSlotManager.getConvenientTimeSlot();
    const expectTimeSlot = {
      月: ['08:00', '08:30', '09:00'],
      水: ['08:00', '08:30', '09:00'],
      火: ['08:00', '08:30', '09:00'],
      金: ['08:00', '08:30', '09:00'],
    };
    expect(actual).toEqual(expectTimeSlot);
  });

  test('When it is 9:00 JST, remove today from convenient time slot', () => {
    jest.setSystemTime(new Date('Thu, 27 Aug 2020 09:00:00 +0900'));
    const actual = TimeSlotManager.getConvenientTimeSlot();
    const expectTimeSlot = {
      月: ['08:00', '08:30', '09:00'],
      水: ['08:00', '08:30', '09:00'],
      火: ['08:00', '08:30', '09:00'],
      金: ['08:00', '08:30', '09:00'],
    };
    expect(actual).toEqual(expectTimeSlot);
  });

  test('When it is 10:00 JST, remove today from convenient time slot', () => {
    jest.setSystemTime(new Date('Thu, 27 Aug 2020 10:00:00 +0900'));
    const actual = TimeSlotManager.getConvenientTimeSlot();
    const expectTimeSlot = {
      月: ['08:00', '08:30', '09:00'],
      木: ['08:00', '08:30', '09:00'],
      水: ['08:00', '08:30', '09:00'],
      火: ['08:00', '08:30', '09:00'],
      金: ['08:00', '08:30', '09:00'],
    };
    expect(actual).toEqual(expectTimeSlot);
  });
});
