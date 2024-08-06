const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getDaysLeft = (date: Date): number => {
  const currentDate = new Date();
  const targetDate = new Date();

  targetDate.setMonth(date.getMonth(), date.getDate());

  if (currentDate > targetDate) {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  }

  const millisecondsDiff = Math.abs(
    currentDate.getTime() - targetDate.getTime(),
  );

  return Math.round(millisecondsDiff / DAY_IN_MS);
};

export const formateDate = (date: Date): string => {
  const year = date.getFullYear();
  let month: number | string = date.getMonth() + 1;
  let day: number | string = date.getDate();

  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;

  return [day, month, year].join('.');
};
