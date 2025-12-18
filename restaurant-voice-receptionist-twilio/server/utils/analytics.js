import { dbUtils } from "./db.js";
import { DateTime } from "luxon";

const timezone = process.env.K_SERVICE ? "Pacific/Pitcairn" : "Asia/Karachi";

export const datesTypes = [
  "Today",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "All Time",
];

export const hoursTypes = [
  "All",
  "12AM - 6AM",
  "6AM - 12PM",
  "12PM - 6PM",
  "6PM - 9PM",
  "9PM - 12AM",
];

const getDayRange = (date) => ({
  start: date.startOf("day").toUTC().toISO(),
  end: date.endOf("day").toUTC().toISO(),
});

const getWeekRange = (date) => ({
  start: date.startOf("week").toUTC().toISO(),
  end: date.endOf("week").toUTC().toISO(),
});

const getMonthRange = (date) => ({
  start: date.startOf("month").toUTC().toISO(),
  end: date.endOf("month").toUTC().toISO(),
});

export const getFirestoreRanges = (dates) => {
  const today = DateTime.now().setZone(timezone);

  let prevPeriodStart, prevPeriodEnd, currentPeriodStart, currentPeriodEnd;

  switch (dates) {
    case "Today":
      currentPeriodStart = getDayRange(today).start;
      currentPeriodEnd = getDayRange(today).end;

      const yesterday = today.minus({ days: 1 });
      prevPeriodStart = getDayRange(yesterday).start;
      prevPeriodEnd = getDayRange(yesterday).end;
      break;

    case "This Week":
      currentPeriodStart = getWeekRange(today).start;
      currentPeriodEnd = getWeekRange(today).end;

      const lastWeek = today.minus({ weeks: 1 });
      prevPeriodStart = getWeekRange(lastWeek).start;
      prevPeriodEnd = getWeekRange(lastWeek).end;
      break;

    case "Last Week":
      const lastWeekStart = today.minus({ weeks: 1 });
      currentPeriodStart = getWeekRange(lastWeekStart).start;
      currentPeriodEnd = getWeekRange(lastWeekStart).end;

      const secondLastWeek = today.minus({ weeks: 2 });
      prevPeriodStart = getWeekRange(secondLastWeek).start;
      prevPeriodEnd = getWeekRange(secondLastWeek).end;
      break;

    case "This Month":
      currentPeriodStart = getMonthRange(today).start;
      currentPeriodEnd = getMonthRange(today).end;

      const lastMonth = today.minus({ months: 1 });

      prevPeriodStart = getMonthRange(lastMonth).start;
      prevPeriodEnd = getMonthRange(lastMonth).end;
      break;

    case "Last Month":
      const lastMonthStart = today.minus({ months: 1 });
      currentPeriodStart = getMonthRange(lastMonthStart).start;
      currentPeriodEnd = getMonthRange(lastMonthStart).end;

      const secondLastMonth = today.minus({ months: 2 });
      prevPeriodStart = getMonthRange(secondLastMonth).start;
      prevPeriodEnd = getMonthRange(secondLastMonth).end;
      break;

    case "All Time":
      currentPeriodStart = DateTime.fromMillis(0).toUTC().toISO();
      currentPeriodEnd = getDayRange(today).end;
      prevPeriodStart = DateTime.fromMillis(0).toUTC().toISO();
      prevPeriodEnd = null;
      break;

    default:
      throw new Error("Invalid date range option");
  }

  return {
    prevPeriodStart: dbUtils.toDBTimestamp(prevPeriodStart),
    prevPeriodEnd: dbUtils.toDBTimestamp(prevPeriodEnd),
    currentPeriodStart: dbUtils.toDBTimestamp(currentPeriodStart),
    currentPeriodEnd: dbUtils.toDBTimestamp(currentPeriodEnd),
  };
};

export const isTimeInRange = (range, utcTimestamp) => {
  const localTime = DateTime.fromJSDate(utcTimestamp, { zone: "utc" }).setZone(
    timezone
  );

  const hour = localTime.hour;
  const minute = localTime.minute;

  if (range === "All") {
    return true;
  }

  const [start, end] = range.split(" - ").map((timeStr) => {
    const [time, period] = timeStr.split(/(AM|PM)/);
    let [hours] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }
    if (period === "AM" && hours === 12) {
      hours = 0;
    }
    return { hours, minutes: 0 };
  });

  const isInRange =
    (hour > start.hours || (hour === start.hours && minute >= start.minutes)) &&
    (hour < end.hours || (hour === end.hours && minute < end.minutes));

  return isInRange;
};

export const isInRange = (start, end, current) => {
  if (
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    !(current instanceof Date)
  ) {
    throw new Error("All inputs must be valid Date objects");
  }

  return current >= start && current <= end;
};

export const findMaxCoincidingCalls = (calls) => {
  if (!Array.isArray(calls)) {
    throw new Error("Input must be an array of calls");
  }

  const events = [];

  calls.forEach(({ startTime, endTime }) => {
    if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
      throw new Error(
        "Each call must have valid Date objects for startTime and endTime"
      );
    }
    events.push({ time: startTime, type: "start" });
    events.push({ time: endTime, type: "end" });
  });

  events.sort((a, b) => a.time - b.time || (a.type === "end" ? -1 : 1));

  let maxCoinciding = 0;
  let currentCoinciding = 0;

  events.forEach((event) => {
    if (event.type === "start") {
      currentCoinciding++;
      maxCoinciding = Math.max(maxCoinciding, currentCoinciding);
    } else if (event.type === "end") {
      currentCoinciding--;
    }
  });

  return maxCoinciding === 1 ? 0 : maxCoinciding;
};

export const getInitialChartData = (start, end) => {
  const localStart = DateTime.fromJSDate(start, {
    zone: "utc",
  }).setZone(timezone);

  const localEnd = DateTime.fromJSDate(end, {
    zone: "utc",
  }).setZone(timezone);

  let labels;
  let currentData = [];
  let previousData = [];

  const dateDifference = Math.ceil(localEnd.diff(localStart, "days").days);

  if (dateDifference === 0) {
    labels = [
      "12a",
      "1a",
      "2a",
      "3a",
      "4a",
      "5a",
      "6a",
      "7a",
      "8a",
      "9a",
      "10a",
      "11a",
      "12p",
      "1p",
      "2p",
      "3p",
      "4p",
      "5p",
      "6p",
      "7p",
      "8p",
      "9p",
      "10p",
      "11p",
    ];
    previousData = Array(24).fill(0);
    currentData = Array(24).fill(0);
  } else if (dateDifference <= 7) {
    labels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    previousData = Array(7).fill(0);
    currentData = Array(7).fill(0);
  } else if (dateDifference <= 31) {
    labels = Array.from({ length: dateDifference }, (_, i) => i + 1);
    previousData = Array(dateDifference).fill(0);
    currentData = Array(dateDifference).fill(0);
  } else {
    const start = DateTime.local(2024, 10, 1).setZone(timezone);
    const now = DateTime.now().setZone(timezone);
    const monthsArray = [];

    let current = start;
    while (current <= now) {
      monthsArray.push(current.toFormat("MMM yy"));
      current = current.plus({ months: 1 });
    }

    labels = monthsArray;
    currentData = Array(monthsArray.length).fill(0);
    previousData = [];
  }

  return { labels, currentData, previousData };
};

export const getUpdatedChartData = (
  start,
  end,
  data,
  callStartTime,
  isCurrentPeriod
) => {
  const localStart = DateTime.fromJSDate(start, {
    zone: "utc",
  }).setZone(timezone);

  const localEnd = DateTime.fromJSDate(end, {
    zone: "utc",
  }).setZone(timezone);

  const localStartTime = DateTime.fromJSDate(callStartTime, {
    zone: "utc",
  }).setZone(timezone);

  const dateDifference = Math.ceil(localEnd.diff(localStart, "days").days);

  if (dateDifference === 0) {
    const hour = localStartTime.hour;
    if (isCurrentPeriod) {
      data.currentData[hour]++;
    } else {
      data.previousData[hour]++;
    }
  } else if (dateDifference <= 7) {
    const day = localStartTime.weekday - 1;
    if (isCurrentPeriod) {
      data.currentData[day]++;
    } else {
      data.previousData[day]++;
    }
  } else if (dateDifference <= 31) {
    const day = localStartTime.day - 1;
    if (isCurrentPeriod) {
      data.currentData[day]++;
    } else {
      data.previousData[day]++;
    }
  } else {
    const month = localStartTime.toFormat("MMM yy");
    const index = data.labels.indexOf(month);
    if (isCurrentPeriod) {
      data.currentData[index]++;
    }
  }

  return data;
};

export const getTopicIndex = (topic) => {
  const topics = [
    "Reservations",
    "Address",
    "Pickup",
    "Delivery",
    "Catering",
    "Dietary",
    "Other",
  ];

  return topics.indexOf(topic) == -1 ? 6 : topics.indexOf(topic);
};

export const formatPercentage = (val) => {
  return ` ${val.toFixed(2)}%`;
};
