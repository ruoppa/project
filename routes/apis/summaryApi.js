import { summarizeLastSeven, summarizeDay } from "../../services/behaviorService.js";
import { getCurrentDate } from "../../services/utilService.js";

// Summary of the last seven days as a JSON document
const lastSevenApi = async({response}) => {
    const res = await summarizeLastSeven(getCurrentDate());
    if (res && res.rowCount > 0 && res.rowsOfObjects()[0].mood) {
        response.body = res.rowsOfObjects()[0];
        return
    } else {
        response.body = {};
        return;
    }
}

// Summary of the day determined by params as a JSON document
const givenDayApi = async({params, response}) => {
    const res = await summarizeDay(params.year, params.month, params.day);
    if (res && res.rowCount > 0 && res.rowsOfObjects()[0].mood) {
        response.body = res.rowsOfObjects()[0];
        return
    } else {
        response.body = {};
        return;
    }
}

export { lastSevenApi, givenDayApi };