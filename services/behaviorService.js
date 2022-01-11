import { executeQuery } from "../database/database.js";

// Returns rows from the morning table with the given id and date
const getExistingMorn = async(date, id) => {
    const res = await executeQuery("SELECT * FROM morning WHERE date = $1 AND user_id = $2;", date, id);
    return res;
}

// Returns rows from the evening table with the given id and date
const getExistingEven = async(date, id) => {
    const res = await executeQuery("SELECT * FROM evening WHERE date = $1 AND user_id = $2;", date, id);
    return res;
}

// Adds the given row to table morning
const addToMorn = async(date, id, sleepdur, sleepqual, mood) => {
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5);", 
                        date, 
                        id, 
                        sleepdur, 
                        sleepqual, 
                        mood);
}

// Adds the given row to table evening
const addToEven = async(date, id, sports, studying, eating, mood) => {
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 
                        date, 
                        id, 
                        sports, 
                        studying,
                        eating,
                        mood); 
}

// Returns summary of the given week for the given user id
const summarizeWeek = async(week, year, id) => {
    const res = await executeQuery("SELECT TO_CHAR(AVG(CAST(COALESCE(mood_m, 0) + COALESCE(mood_e, 0) AS REAL) / 2), 'FM90.09') AS mood, TO_CHAR(AVG(COALESCE(sleepdur, 0)), 'FM90.09') AS sleepdur, TO_CHAR(AVG(COALESCE(sleepqual, 0)), 'FM90.09') AS sleepqual, TO_CHAR(AVG(COALESCE(eating, 0)), 'FM90.09') AS eating, TO_CHAR(AVG(COALESCE(sports, 0)), 'FM90.09') AS sports, TO_CHAR(AVG(COALESCE(studying, 0)), 'FM90.09') AS studying FROM morning FULL OUTER JOIN evening USING(date, user_id) WHERE extract('week' FROM date) = $1 AND extract('year' FROM date) = $2 AND user_id = $3;",
                                    week,
                                    year,
                                    id);
    return res;
}

// Returns summary of the given month for the given user id
const summarizeMonth = async(month, year, id) => {
    const res = await executeQuery("SELECT TO_CHAR(AVG(CAST(COALESCE(mood_m, 0) + COALESCE(mood_e, 0) AS REAL) / 2), 'FM90.09') AS mood, TO_CHAR(AVG(COALESCE(sleepdur, 0)), 'FM90.09') AS sleepdur, TO_CHAR(AVG(COALESCE(sleepqual, 0)), 'FM90.09') AS sleepqual, TO_CHAR(AVG(COALESCE(eating, 0)), 'FM90.09') AS eating, TO_CHAR(AVG(COALESCE(sports, 0)), 'FM90.09') AS sports, TO_CHAR(AVG(COALESCE(studying, 0)), 'FM90.09') AS studying FROM morning FULL OUTER JOIN evening USING(date, user_id) WHERE extract('month' FROM date) = $1 AND extract('year' FROM date) = $2 AND user_id = $3;",
                                    month,
                                    year,
                                    id);
    return res;
}

// Retrieves the information used on the landing page
const summarizeMood = async(date) => {
    const res = await executeQuery("SELECT TO_CHAR(AVG(CAST(COALESCE(mood_m, 0) + COALESCE(mood_e, 0) AS REAL) / 2), 'FM90.09') AS mood FROM morning FULL OUTER JOIN evening USING(date, user_id) WHERE date = $1;",
                                    date);
    return res;
}

/* Returns summary of the last seven days (parameter date is today)
 * used by the api
 */
const summarizeLastSeven = async(date) => {
    const res = await executeQuery("SELECT TO_CHAR(AVG(CAST(COALESCE(mood_m, 0) + COALESCE(mood_e, 0) AS REAL) / 2), 'FM90.09') AS mood, TO_CHAR(AVG(COALESCE(sleepdur, 0)), 'FM90.09') AS sleep_duration, TO_CHAR(AVG(COALESCE(sleepqual, 0)), 'FM90.09') AS sleep_quality, TO_CHAR(AVG(COALESCE(eating, 0)), 'FM90.09') AS eating, TO_CHAR(AVG(COALESCE(sports, 0)), 'FM90.09') AS sports, TO_CHAR(AVG(COALESCE(studying, 0)), 'FM90.09') AS studying FROM morning FULL OUTER JOIN evening USING(date, user_id) WHERE date + 7 > $1",
                                    date);
    return res;
}

// Returns a summary of the day given as a parameter. Used by the api
const summarizeDay = async(year, month, day) => {
    const res = await executeQuery("SELECT TO_CHAR(AVG(CAST(COALESCE(mood_m, 0) + COALESCE(mood_e, 0) AS REAL) / 2), 'FM90.09') AS mood, TO_CHAR(AVG(COALESCE(sleepdur, 0)), 'FM90.09') AS sleep_duration, TO_CHAR(AVG(COALESCE(sleepqual, 0)), 'FM90.09') AS sleep_quality, TO_CHAR(AVG(COALESCE(eating, 0)), 'FM90.09') AS eating, TO_CHAR(AVG(COALESCE(sports, 0)), 'FM90.09') AS sports, TO_CHAR(AVG(COALESCE(studying, 0)), 'FM90.09') AS studying FROM morning FULL OUTER JOIN evening USING(date, user_id) WHERE extract('day' FROM date) = $1 AND extract('month' FROM date) = $2 AND extract('year' FROM date) =  $3;", 
                                    day, 
                                    month, 
                                    year);
    return res;
}

export { getExistingMorn, getExistingEven, addToMorn, addToEven, summarizeWeek, summarizeMonth, summarizeMood, summarizeLastSeven, summarizeDay };