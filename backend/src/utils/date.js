function startOfDayUTC(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysBetweenUTC(a, b) {
  const ms = startOfDayUTC(b).getTime() - startOfDayUTC(a).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function addDaysUTC(date, days) {
  const d = startOfDayUTC(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function rangeDaysInclusive(endDate, window) {
  const end = startOfDayUTC(endDate);
  const start = addDaysUTC(end, -(window - 1));
  return { start, end };
}

module.exports = { startOfDayUTC, daysBetweenUTC, addDaysUTC, rangeDaysInclusive };
