import { formatInTimeZone } from 'date-fns-tz';

export const getFormattedDate = (
  unixTimestamp: string | undefined,
  withYear: boolean,
  onlyYear: boolean = false,
): string => {
  if (unixTimestamp) {
    const ohioTimeZone = 'America/New_York';

    const date = new Date(unixTimestamp);

    let formatString;

    if (withYear === true) {
      formatString = 'd MMM yyyy hh:mm a';
    } else {
      formatString = 'd MMM hh:mm a';
    }

    if (onlyYear === true) {
      formatString = 'd MMM yyyy';
    }

    const ret = formatInTimeZone(date, ohioTimeZone, formatString);
    return ret;
  } else {
    return '';
  }
};

export const getFilenameTimestamp = (): string => {
  const now = new Date();
  const timeZone = 'America/New_York';
  const formatString = "yyyy-MM-dd'T'HH:mm:ss";

  return formatInTimeZone(now, timeZone, formatString);
};
