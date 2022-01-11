import { app } from "../../../app.js";
import { superoak } from "../../../deps.js";
import { executeQuery } from "../../../database/database.js";
import { getCurrentDate, getMonth, getYear, getWeek } from "../../../services/utilService.js";
import { addUser, resetDatabase } from "../../util/testUtil.js";

Deno.test("GET request to /behavior/summary should return the expected content when no reports have been made", async() => {
    await addUser();

    const auth = await superoak(app);
    const res = await auth.post("/auth/test")
                            .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(";")[0];

    const test = await superoak(app);
    await test.get("/behavior/summary")
                .set("Cookie", cookie)
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect(`<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/behavior/reporting">Reporting</a></td>\n                    <td><a href="/behavior/summary">Summary</a></td>\n                    <td>Logged in as test@mail.net</td>\n                    <td><a href="/auth/logout"> Log out</a></td>\n                </table>\n                \n            </nav>\n<h1>Summary of your data</h1>\n<h2>Weekly averages: </h2>\n<div>\n    \n    <p>No data for the given week</p>\n    \n</div>\n<h2>Monthly averages: </h2>\n<div>\n    \n    <p>No data for the given month</p>\n    \n</div>\n<form method="POST" action="/behavior/summary">\n    <div>\n        \n        \n        <label>Week: <input type="week" name="week" value="${getYear()}-W${getWeek()}"/></label>\n    </div>\n    <div>\n        \n        \n        <label>Month: <input type="month" name="month" value="${getYear()}-${getMonth()}"/></label>\n    </div>\n    <div>\n        <input type="submit" value="Show averages"/>\n    </div>\n</form>\n        </div>\n    </body>\n</html>`);
                
    await resetDatabase();
});

Deno.test("GET request to /behavior/summary should return summary of the current week and month when there is data available", async() => {
    await addUser();

    // Add data for today
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, 1, 2, 2, 1);", getCurrentDate());
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, 1, 8, 6, 5, 5);", getCurrentDate());

    const auth = await superoak(app);
    const res = await auth.post("/auth/test")
                            .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(";")[0];

    const test = await superoak(app);
    await test.get("/behavior/summary")
                .set("Cookie", cookie)
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect(`<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/behavior/reporting">Reporting</a></td>\n                    <td><a href="/behavior/summary">Summary</a></td>\n                    <td>Logged in as test@mail.net</td>\n                    <td><a href="/auth/logout"> Log out</a></td>\n                </table>\n                \n            </nav>\n<h1>Summary of your data</h1>\n<h2>Weekly averages: </h2>\n<div>\n    \n    <ul>\n        <li>Average sleep duration: 2.0</li>\n        <li>Average sleep quality: 2.0</li>\n        <li>Average time spent exercising: 8.0</li>\n        <li>Average time spent studying: 6.0</li>\n        <li>Average eating regularity/quality: 5.0</li>\n        <li>Average generic mood: 3.0</li>\n    </ul>\n    \n</div>\n<h2>Monthly averages: </h2>\n<div>\n    \n    <ul>\n        <li>Average sleep duration: 2.0</li>\n        <li>Average sleep quality: 2.0</li>\n        <li>Average time spent exercising: 8.0</li>\n        <li>Average time spent studying: 6.0</li>\n        <li>Average eating regularity/quality: 5.0</li>\n        <li>Average generic mood: 3.0</li>\n    </ul>\n    \n</div>\n<form method="POST" action="/behavior/summary">\n    <div>\n        \n        \n        <label>Week: <input type="week" name="week" value="${getYear()}-W${getWeek()}"/></label>\n    </div>\n    <div>\n        \n        \n        <label>Month: <input type="month" name="month" value="${getYear()}-${getMonth()}"/></label>\n    </div>\n    <div>\n        <input type="submit" value="Show averages"/>\n    </div>\n</form>\n        </div>\n    </body>\n</html>`);
                
    await resetDatabase();
});