"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilenameTimestamp = exports.getFormattedDate = void 0;
const date_fns_tz_1 = require("date-fns-tz");
const getFormattedDate = (unixTimestamp, withYear, onlyYear = false) => {
    if (unixTimestamp) {
        const ohioTimeZone = 'America/New_York';
        const date = new Date(unixTimestamp);
        let formatString;
        if (withYear === true) {
            formatString = 'd MMM yyyy hh:mm a';
        }
        else {
            formatString = 'd MMM hh:mm a';
        }
        if (onlyYear === true) {
            formatString = 'd MMM yyyy';
        }
        const ret = (0, date_fns_tz_1.formatInTimeZone)(date, ohioTimeZone, formatString);
        return ret;
    }
    else {
        return '';
    }
};
exports.getFormattedDate = getFormattedDate;
const getFilenameTimestamp = () => {
    const now = new Date();
    const timeZone = 'America/New_York';
    const formatString = "yyyy-MM-dd'T'HH:mm:ss";
    return (0, date_fns_tz_1.formatInTimeZone)(now, timeZone, formatString);
};
exports.getFilenameTimestamp = getFilenameTimestamp;
//# sourceMappingURL=getFormattedDate.js.map