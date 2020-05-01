const puppeteer = require('puppeteer');

const TEACHER_IDS = process.env.RESERVE_TEACHER_IDS;
const EMAIL = process.env.NC_EMAIL;
const PASSWORD = process.env.NC_PASSWORD;

const nativecampTopUrl = 'https://nativecamp.net/';
const nativecampLoginUrl = 'https://nativecamp.net/login';
const nativecampMypageUrl = 'https://nativecamp.net/mypage';

const DAY_OF_WEEK = {
  sun: '日',
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
};

const RESERVABLE_BUTTON_SELECTER = '.btn_style.btn_green.forReservation';
const DOUBLE_BOOKING_BUTTON_SELECTER = '.btn_style.double_booking';
const ALREADY_RSERVED_BUTTON_SELECTER = '.btn_style.reserved.forCancellation';
const RESERVE_MODAL_VISIBLE_SELECTER = '.title.t_truncate';
const RESERVE_SELECT_COURSE_BUTTON_SELECTER =
  '#chooseReservedSchedule.btn_style.btn_green.btnLessonOrReserve';
const RESERVE_ALT_TEACHER_SWITCH_SELECTER = '.nc_ui_checkbox_switch_slider';
const RESERVE_ALT_TEACHER_BUTTON_SELECTER =
  '#chooseReservedSchedule.btn_style.btn_green.close_modal';
const RESERVE_CONFIRM_MODAL_SELECTER = '#dialog_schedule_reserve_confirm';
const RESERVE_CONFIRM_BUTTON =
  '#saveReservedSchedule.btn_style.btn_green.close_modal.btnReservationConfirmed';
const RESERVE_COMPLETE_MODAL_SELECTER = '#dialog_schedule_reserve_complete';
const RESERVE_COMPLETE_MODAL_CLOSE_BUTTON_SELECTER =
  '#dialog_schedule_reserve_complete > .btn_close.close_modal';

const getPreferableTimeSlot = () => {
  /*
    example output
    {
      '月': ['08:00', '08:30', '21:00'],
      '火': ['08:00', '08:30', '21:00'],
    }
  */
  let preferableTimeSlot = {};
  [
    DAY_OF_WEEK.mon,
    DAY_OF_WEEK.tue,
    DAY_OF_WEEK.wed,
    DAY_OF_WEEK.thu,
    DAY_OF_WEEK.fri,
  ].map((day) => {
    preferableTimeSlot[day] = ['08:00', '08:30', '09:00'];
  });
  return preferableTimeSlot;
};

function getTeacherPageUrl(teacherID) {
  if (!teacherID) {
    throw new Error('teacherID cannot be null or undefined.');
  }
  return `${nativecampTopUrl}waiting/detail/${teacherID}`;
}

let screenshotId = 0;
async function screenshotWithId(page, baseName = 'screenshots/screenshot') {
  const screenshotIdString = String(screenshotId).padStart(3, '0');
  await page.screenshot({ path: `${baseName}${screenshotIdString}.png` });
  screenshotId += 1;
}

async function login(page, email, password) {
  if (!page) {
    throw new Error('page cannot be null or undefined.');
  }
  if (!email || !password) {
    throw new Error('Email or Password cannot be null or undefined.');
  }

  await page.goto(nativecampLoginUrl);
  await screenshotWithId(page);

  await page.type('input[name="data[User][email]"', EMAIL);
  await page.type('input[name="data[User][password]"', PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]'),
  ]);
  await screenshotWithId(page);
  return true;
}

async function isLoggedIn(page) {
  if (!page) {
    throw new Error('page cannot be null or undefined.');
  }

  await page.goto(nativecampMypageUrl).catch((e) => {
    console.log(e);
    return false;
  });

  // if succeeded to login, location is mypage
  // otherwise locaiton is login page
  return page.url() === nativecampMypageUrl;
}

async function doReserve(page, reserveButton) {
  let isError = false;
  await Promise.all([
    page.waitForSelector(RESERVE_MODAL_VISIBLE_SELECTER),
    reserveButton.click(),
  ]).catch((e) => {
    console.log(e);
    isError = true;
  });
  await screenshotWithId(page);
  if (isError) {
    return false;
  }

  const course = await page.$eval(
    RESERVE_MODAL_VISIBLE_SELECTER,
    (node) => node.innerText,
  );
  if (!course.includes('カランコース')) {
    console.log('not selected カラン.');
  }

  const selectCourseButton = await page.$(
    RESERVE_SELECT_COURSE_BUTTON_SELECTER,
  );
  await Promise.all([
    page.waitForSelector(RESERVE_ALT_TEACHER_SWITCH_SELECTER),
    selectCourseButton.click(),
  ]).catch((e) => {
    console.log(e);
    isError = true;
  });
  await screenshotWithId(page);
  if (isError) {
    return false;
  }

  const switchAltTeacher = await page.$(RESERVE_ALT_TEACHER_SWITCH_SELECTER);
  await switchAltTeacher.click();

  const switchAltTeacherButton = await page.$(
    RESERVE_ALT_TEACHER_BUTTON_SELECTER,
  );
  await Promise.all([
    page.waitForSelector(RESERVE_CONFIRM_MODAL_SELECTER, { visible: true }),
    switchAltTeacherButton.click(),
  ]).catch((e) => {
    console.log(e);
    isError = true;
  });
  await screenshotWithId(page);
  if (isError) {
    return false;
  }

  const reserveConfirmButton = await page.$(RESERVE_CONFIRM_BUTTON);
  await Promise.all([
    page.waitForSelector(RESERVE_COMPLETE_MODAL_SELECTER, {
      visible: true,
    }),
    reserveConfirmButton.click(),
  ]).catch((e) => {
    console.log(e);
    isError = true;
  });
  await screenshotWithId(page);

  const closeModalButton = await page.$(
    RESERVE_COMPLETE_MODAL_CLOSE_BUTTON_SELECTER,
  );
  await Promise.all([
    page.waitForSelector(RESERVE_COMPLETE_MODAL_SELECTER, {
      hidden: true,
    }),
    closeModalButton.click(),
  ]).catch((e) => {
    console.log(e);
    isError = true;
  });
  await screenshotWithId(page);

  console.log('success reseravation');
  return true;
}

async function findReservableTimeAndReserve(
  page,
  reservableAreaElement,
  reservableTime,
) {
  if (!reservableAreaElement) {
    throw new Error('reservableAreaElement cannot be null or undefined.');
  }
  if (!reservableTime || reservableTime.length === 0) {
    throw new Error('reservableTime cannot be null or undefined.');
  }

  const day = await reservableAreaElement.$eval('.day', (node) =>
    node.innerText.substring(1, 2),
  );
  if (!reservableTime.hasOwnProperty(day)) {
    return false;
  }

  const doubleBookingElement = await reservableAreaElement.$(
    DOUBLE_BOOKING_BUTTON_SELECTER,
  );
  if (doubleBookingElement) {
    console.log('double booking found.', day);
    return false;
  }

  const alreadyRservedElement = await reservableAreaElement.$(
    ALREADY_RSERVED_BUTTON_SELECTER,
  );
  if (alreadyRservedElement) {
    console.log('already reserved.', day);
    return false;
  }

  const reserveButtons = await reservableAreaElement.$$(
    RESERVABLE_BUTTON_SELECTER,
  );
  if (reserveButtons.length === 0) {
    console.log('reservable time not found.', day);
    return false;
  }

  let isReserved = false;
  for (reserveButton of reserveButtons) {
    if (isReserved) {
      break;
    }
    try {
      const timeOfButton = await page.evaluate(
        (el) => el.innerText,
        reserveButton,
      );
      if (reservableTime[day].indexOf(timeOfButton) === -1) {
        continue;
      }
      console.log('Try reserve', timeOfButton, day);
      isReserved = await doReserve(page, reserveButton);
    } catch (e) {
      console.log(e);
      continue;
    }
  }
  if (!isReserved) {
    console.log('unmatched to preferable time slot.', day);
  }
  return isReserved;
}

async function reserve(page, teacherID) {
  if (!page) {
    throw new Error('page cannot be null or undefined.');
  }
  if (!teacherID) {
    throw new Error('teacherID cannot be null or undefined.');
  }
  if (!isLoggedIn(page)) {
    await screenshotWithId(page);
    throw new Error('need login before start reservation');
  }

  await page.goto(getTeacherPageUrl(teacherID));
  await screenshotWithId(page);

  const reservableAreaElements = await page.$$(
    'tr[class="free_reservable_area"]',
  );
  for (const reservableAreaElement of reservableAreaElements) {
    isSucceded = await findReservableTimeAndReserve(
      page,
      reservableAreaElement,
      getPreferableTimeSlot(),
    );
  }
}

(async () => {
  let browser = null;
  let options = {
    defaultViewport: {
      width: 1200,
      height: 800,
    },
    slowMo: 100,
  };
  if (process.env.GITHUB_ACTION) {
    // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
    options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
  }
  try {
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await login(page, EMAIL, PASSWORD);

    const teacherIDs = TEACHER_IDS.split(',');
    for (const teacherID of teacherIDs) {
      await reserve(page, teacherID);
    }
  } catch (e) {
    console.log(e);
    process.exitCode = 1;
  } finally {
    if (browser) {
      // puppeteerを終了します
      await browser.close();
    }
  }
})();
