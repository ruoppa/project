import { getExistingMorn, getExistingEven, addToMorn, addToEven } from "../../services/behaviorService.js";
import { validate, required, isDate, numberBetween, isInt } from "../../deps.js";
import { getCurrentDate } from "../../services/utilService.js";

// Date used for viewing /behavior/reporting/morning
let morningData = {
    date: getCurrentDate(),
    sleepdur: "",
    sleepqual: "",
    mood_m: "",
    errors: {}
};

// Date used for viewing /behavior/reporting/evening
let eveningData = {
    date: getCurrentDate(),
    sports: "",
    studying: "",
    eating: "",
    mood_e: "",
    errors: {}
};

// Reset morning data
const resetDataMorn = () => {
    morningData.date = getCurrentDate();
    morningData.sleepdur = "";
    morningData.sleepqual = "";
    morningData.mood_m = "";
    morningData.errors = {};
}
// Reset evening data
const resetDataEven = () => {
    eveningData.date = getCurrentDate();
    eveningData.sports = "";
    eveningData.studying = "";
    eveningData.eating = "";
    eveningData.mood_e = "";
    eveningData.errors = "";
}

/* true if the user has seen the errors caused by validating the
 * morning form
 */
let seenErrorsMorn = true;
// Same as above but for the evening form
let seenErrorsEven = true;

// Validation ruleset for the morning form
const validationRulesMorn = {
    date: [required, isDate],
    sleepdur: [required, numberBetween(0, 24)],
    sleepqual: [required, numberBetween(1, 5), isInt],
    mood_m: [required, numberBetween(1, 5), isInt]
};

// Custom validation error messages for some variables
const messagesMorn = {
    messages: {
        "sleepdur.required": "sleep duration is required",
        "sleepdur.numberBetween": "sleep duration must be a number between 0 and 24",
        "sleepqual.required": "sleep quality is required",
        "sleepqual.numberBetween": "sleep quality must be a number between 1 and 5",
        "sleepqual.isInt": "sleep quality is invalid",
        "mood_m.required": "mood is required",
        "mood_m.numberBetween": "mood must be a number between 1 and 5",
        "mood_m.isInt": "mood is invalid"
    }
};

// Validation ruleset for the evening form
const validationRulesEven = {
    date: [required, isDate],
    sports: [required, numberBetween(0, 24)],
    studying: [required, numberBetween(0, 24)],
    eating: [required, numberBetween(1, 5), isInt],
    mood_e: [required, numberBetween(1, 5), isInt]
};

// Custom validation error messages for some variables
const messagesEven = {
    "mood_e.required": "mood is required",
    "mood_e.numberBetween": "mood must be a number between 1 and 5",
    "mood_e.isInt": "mood is invalid"
};

// Get the data from the morning form request
const getDataMorn = async(request) => {
    const data = {
        date: "",
        sleepdur: "",
        sleepqual: "",
        mood_m: "",
        errors: {}
    };
    if (request) {
        const params = await request.body().value;
        if (!params) {
            return data;
        }
        if (params.has("date")) {
            data.date = params.get("date");
        }
        const sleepdur = params.get("sleepdur");
        if (sleepdur && sleepdur !== "") {
            data.sleepdur = Number(sleepdur);
        } else {
            data.sleepdur = "";
        }
        const sleepqual = params.get("sleepqual");
        if (sleepqual && Number(sleepqual) !== 0) {
            data.sleepqual = Number(sleepqual);
        } else {
            data.sleepqual = sleepqual;
        }
        const mood = params.get("mood_m");
        if (mood && Number(mood) !== 0) {
            data.mood_m = Number(mood);
        } else {
            data.mood_m = mood;
        }
    }
    return data;
}

// Get the date from the evening form request
const getDataEven = async(request) => {
    const data = {
        date: "",
        sports: "",
        studying: "",
        eating: "",
        mood_e: "",
        errors: {}
    };
    if (request) {
        const params = await request.body().value;
        if(!params) {
            return data;
        }
        if (params.has("date")) {
            data.date = params.get("date");
        }
        const sports = params.get("sports");
        if (sports && sports !== "") {
            data.sports = Number(sports);
        } else {
            data.sports = "";
        }
        const studying = params.get("studying");
        if (studying && studying !== "") {
            data.studying = Number(studying);
        } else {
            data.studying = "";
        }
        const eating = params.get("eating");
        if (eating && Number(eating) !== 0) {
            data.eating = Number(eating);
        } else {
            data.eating = eating;
        }
        const mood = params.get("mood_e");
        if (mood && Number(mood) !== 0) {
            data.mood_e = Number(mood);
        } else {
            data.mood_e = mood;
        }
    }
    return data;
}

const showMorning = async({render, session}) => {
    if (seenErrorsMorn) {
        resetDataMorn();
    }

    const user = await session.get("user");
    morningData.user = user;

    render("./reporting/morning.ejs", morningData);
    if (!seenErrorsMorn) {
        seenErrorsMorn = true;
    }
}

const showEvening = async({render, session}) => {
    if (seenErrorsEven) {
        resetDataEven();
    }

    const user = await session.get("user");
    eveningData.user = user;

    render("./reporting/evening.ejs", eveningData);
    if (!seenErrorsEven) {
        seenErrorsEven = true;
    }
}

const postMorning = async({request, response, session}) => {
    resetDataMorn();

    const data = await getDataMorn(request);
    const [passes, errors] = await validate(data, validationRulesMorn, messagesMorn);
    if (!passes) {
        data.errors = errors;
        morningData = data;
        seenErrorsMorn = false;
        response.redirect("/behavior/reporting/morning");
        return;
    }
    const user = await session.get("user");
    const existingData = await getExistingMorn(data.date, user.id);
    /* The user can only enter data once per each morning and evening.
     * Trying to enter data again will result in an error message
     */
    if (existingData && existingData.rowCount > 0) {
        errors.date = {};
        errors.date.isReserved = "you have already entered data for the chosen date";
        data.errors = errors;
        morningData = data;
        seenErrorsMorn = false;
        response.redirect("/behavior/reporting/morning");
        return;
    }
    // Insert the given information into the database
    await addToMorn(data.date, user.id, Number(data.sleepdur), Number(data.sleepqual), Number(data.mood_m));
    response.redirect("/behavior/reporting");
}

const postEvening = async({request, response, session}) => {
    resetDataEven();

    const data = await getDataEven(request);
    const [passes, errors] = await validate(data, validationRulesEven, messagesEven);
    if (!passes) {
        data.errors = errors;
        eveningData = data;
        seenErrorsEven = false;
        response.redirect("/behavior/reporting/evening");
        return;
    }
    const user = await session.get("user");
    const existingData = await getExistingEven(data.date, user.id);

    if (existingData && existingData.rowCount > 0) {
        errors.date = {};
        errors.date.isReserved = "you have already entered data for the chosen date";
        data.errors = errors;
        eveningData = data;
        seenErrorsEven = false;
        response.redirect("/behavior/reporting/evening");
        return;
    }

    await addToEven(data.date, user.id, data.sports, data.studying, data.eating, data.mood_e);
    response.redirect("/behavior/reporting");
}

/* Shows the landing page for reporting with links to morning and
 * evening reporting forms as well as information on whether the
 * user has alredy reported on the current day
 */
const showReporting = async({render, session}) => {
    const data = {
        morning: "",
        evening: "",
        user: {}
    };
    const user = await session.get("user");
    data.user = user;
    const morning = await getExistingMorn(getCurrentDate(), user.id);
    const evening = await getExistingEven(getCurrentDate(), user.id);

    if (morning && morning.rowCount > 0) {
        data.morning = "(Already reported today)";
    }
    if (evening && evening.rowCount > 0) {
        data.evening = "(Already reported today)";
    }
    render("./reporting/reporting.ejs", data);
}

export { showMorning, showEvening, postMorning, postEvening, showReporting };