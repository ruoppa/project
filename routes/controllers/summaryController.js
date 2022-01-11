import { summarizeMood, summarizeWeek, summarizeMonth } from "../../services/behaviorService.js";
import { getCurrentDate, getYesterday, getWeek, getMonth, getYear } from "../../services/utilService.js";
import { required, numberBetween, minNumber, validate, isInt } from "../../deps.js";

const showLanding = async({render, session}) => {
    const data = {
        user: {},
        today: false,
        yesterday: false
    };
    /* Links to reporting and summary pages will only be shown on the
     * landing page if the user is authorized (logged in) Otherwise
     * links to login and register page will be displayed
     */
    const auth = await session.get("auth");
    if (auth) {
        data.user = await session.get("user");
    }

    const todayData = await summarizeMood(getCurrentDate());
    if (todayData && todayData.rowCount !== 0) {
        const obj = todayData.rowsOfObjects()[0];
        data.today = obj.mood;
    }

    const yesterdayData = await summarizeMood(getYesterday());
    if (yesterdayData && yesterdayData.rowCount !== 0) {
        const obj = yesterdayData.rowsOfObjects()[0];
        data.yesterday = obj.mood;
    }

    render("index.ejs", data);
}

// Validation rules fot the summary form
const validationRules = {
    weeknum: [required, numberBetween(1, 53), isInt],
    monthnum: [required, numberBetween(1, 12), isInt],
    // Year can not be negative
    weekyear: [required, minNumber(1970), isInt],
    monthyear: [required, minNumber(1970), isInt]
};

const data = {
    weekly: {},
    monthly: {},
    weeknum: getWeek(),
    monthnum: getMonth(),
    weekyear: getYear(),
    monthyear: getYear(),
    week: String(getYear()) + "-W" + String(getWeek()).padStart(2, "0"),
    month: String(getYear()) + String(getMonth()).padStart(2, "0"),
    errors: {}
};

// Custom validation error messages for some variables
const messages = {
    messages: {
        "weeknum.required": "week is required",
        "weeknum.numberBetween": "week must be a number between 1 and 53",
        "weeknum.isInt": "week must be an integer",
        "monthnum.required": "month is required",
        "monthnum.numberBetween": "month must be a number between 1 and 12",
        "monthnum.isInt": "month must be an integer",
        "weekyear.isRequired": "year is required",
        "weekyear.numberBetween": "year must be at least 1970",
        "weekyear.isInt": "year must be an integer",
        "monthyear.isRequired": "year is required",
        "monthyear.numberBetween": "year must be at least 1970",
        "monthyear.isInt": "year must be an integer"      
    }
};

const resetData = () => {
    data.weekly = {};
    data.monthly = {};
    data.weeknum = getWeek();
    data.monthnum = getMonth();
    data.weekyear = getYear();
    data.monthyear = getYear(),
    data.week = String(data.weekyear) + "-W" + String(data.weeknum).padStart(2, "0");
    data.month = String(data.weekyear) + "-" + String(data.monthnum).padStart(2, "0");
    data.errors = {};
}

let seenData = true;

const showSummary = async({render, session}) => {
    if (seenData) {
        resetData();
    }

    /* In case of errors of errors when validating the form, the previous
     * summary is shown
     */
    const user = await session.get("user");
    data.user = user;
    if (Object.keys(data.errors).length === 0) {
        const weekly = await summarizeWeek(data.weeknum, data.weekyear, user.id);
        if (weekly && weekly.rowCount !== 0 && weekly.rowsOfObjects()[0].mood) {
            data.weekly = weekly.rowsOfObjects()[0];
        } else {
            data.weekly = {};
        }
        const monthly = await summarizeMonth(data.monthnum, data.monthyear, user.id);
        if (monthly && monthly.rowCount !== 0 && monthly.rowsOfObjects()[0].mood) {
            data.monthly = monthly.rowsOfObjects()[0];
        } else {
            data.monthly = {};
        }
    }

    render("./summary/summary.ejs", data);

    if (!seenData) {
        seenData = true;
    }
}

const postSummary = async({request, response}) => {

    const params = await request.body().value;
    if (params) {
        if (params.has("week")) {
            data.week = params.get("week");
        } else {
            data.week = "";
        }
        if (params.has("month")) {
            data.month = params.get("month");
        } else {
            data.month = "";
        }
        const weekArr = data.week.split("-");
        const monthArr = data.month.split("-");
    
        /* Parsing the week input manually, since there is no validating
         * function for it
         */
        if (weekArr.length === 2) {
            const y = Number(weekArr[0]);
            if (!Number.isNaN(y)) {
                data.weekyear = y;
            } else {
                data.weekyear = "";
            }
            const w = weekArr[1];
            if (w !== "") {
                if (w.length !== 3 || !w.startsWith("W") || Number.isNaN(Number(w.substring(1)))) {
                    console.log("here");
                    data.weeknum = "";
                } else {
                    data.weeknum = Number(w.substring(1));
                }
            } else {
                data.weeknum = "";
            }
        } else {
            data.weekyear = "";
            data.weeknum = "";
        }
    
        // Parsing the month input manually
        if (monthArr.length === 2) {
            const y = Number(monthArr[0]);
            if (!Number.isNaN(y)) {
                data.monthyear = y;
            } else {
                data.monthyear = "";
            }
            const m = monthArr[1];
            if (m !== "") {
                if (m.length !== 2 || Number.isNaN(Number(m))) {
                    data.monthnum = "";
                } else {
                    data.monthnum = Number(m);
                }
            } else {
                data.monthnum = "";
            }
        } else {
            data.monthyear = "";
            data.monthnum = "";
        }
    } else {
        data.week = "";
        data.month = "";
        data.weeknum = "";
        data.monthnum = "";
        data.weekyear = "";
        data.monthyear = "";
    }


    const [passes, errors] = await validate(data, validationRules);
    
    if (!passes) {
        data.errors = errors;
    } else {
        data.errors = {};
    }
    seenData = false;
    response.redirect("/behavior/summary");
}

export { showLanding, showSummary, postSummary };