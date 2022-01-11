/* Returns the current date in the correct  to use with databases
 * and forms
 */
const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear());
    const res = year + "-" + month + "-" + day;
    return res;
}

// Same as above but for yesterday
const getYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const day = String(yesterday.getDate()).padStart(2, "0");
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const year = String(yesterday.getFullYear());
    const res = year + "-" + month + "-" + day;
    return res;
}

/* Get number of the current week. Source for function:
 * https://weeknumber.net/how-to/javascript
 */
const getWeek = () => {
    const today = new Date();
    const date = new Date(today.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

const getYear = () => {
    const today = new Date();
    return today.getFullYear();
}

const getMonth = () => {
    const today = new Date();
    return today.getMonth() + 1;
}

export { getCurrentDate, getYesterday, getWeek, getYear, getMonth };