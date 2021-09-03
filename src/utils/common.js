import dayjs from 'dayjs';
import { Keydown } from '../enums';

const getRandomInteger = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

const transformDateToUsFormat = (dateStr) => {
  const [day, month, year] = dateStr.split('/');

  return dayjs(`${month}/${day}/${year}`);
};

const humanizeEventDate = (dateStr, format = 'DD/MM/YY HH:mm') => {
  if (typeof dateStr === 'string') {
    dateStr = transformDateToUsFormat(dateStr);
  }

  if (!dateStr.format) {
    dateStr = dayjs(dateStr);
  }

  return dateStr.format(format);
};

const humanizeEventStartDate = (startDate) => humanizeEventDate(startDate, 'MMM DD');

const onEscKeyDown = (evt, callback) => {
  if (evt.key === Keydown.ESCAPE) {
    evt.preventDefault();
    callback();
    document.removeEventListener('keydown', onEscKeyDown);
  }
};

export {
  getRandomInteger,
  humanizeEventDate,
  humanizeEventStartDate,
  transformDateToUsFormat,
  onEscKeyDown
};
