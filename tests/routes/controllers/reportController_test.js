import { app } from "../../../app.js";
import { superoak } from "../../../deps.js";
import { executeQuery } from "../../../database/database.js";
import { getCurrentDate } from "../../../services/utilService.js";
import { addUser, resetDatabase } from "../../util/testUtil.js";

Deno.test("GET request to /behavior/reporting should return the expected content when no reports have been made", async() => {
    await addUser();

    const auth = await superoak(app);
    const res = await auth.post("/auth/test")
                            .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(";")[0];

    const test = await superoak(app);
    await test.get("/behavior/reporting")
                .set("Cookie", cookie)
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/behavior/reporting">Reporting</a></td>\n                    <td><a href="/behavior/summary">Summary</a></td>\n                    <td>Logged in as test@mail.net</td>\n                    <td><a href="/auth/logout"> Log out</a></td>\n                </table>\n                \n            </nav>\n<h1>Reporting</h1>\n<div> \n    <label><a href="/behavior/reporting/morning">Morning reporting</a></label>\n</div>\n<div>\n    <label><a href="/behavior/reporting/evening">Evening reporting</a></label>\n</div>\n        </div>\n    </body>\n</html>');
                
    await resetDatabase();
});

Deno.test("GET request to /behavior/reporting should return the expected content when the user has reported data today", async() => {
    await addUser();
    // Add data for today morning
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, 1, 2, 2, 1);", getCurrentDate());

    const auth = await superoak(app);
    const res = await auth.post("/auth/test")
                            .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(";")[0];

    const test = await superoak(app);
    await test.get("/behavior/reporting")
                .set("Cookie", cookie)
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/behavior/reporting">Reporting</a></td>\n                    <td><a href="/behavior/summary">Summary</a></td>\n                    <td>Logged in as test@mail.net</td>\n                    <td><a href="/auth/logout"> Log out</a></td>\n                </table>\n                \n            </nav>\n<h1>Reporting</h1>\n<div> \n    <label><a href="/behavior/reporting/morning">Morning reporting</a>(Already reported today)</label>\n</div>\n<div>\n    <label><a href="/behavior/reporting/evening">Evening reporting</a></label>\n</div>\n        </div>\n    </body>\n</html>');
                
    await resetDatabase();
});

Deno.test("GET request to /behavior/reporting/morning should return the morning reporting form", async() => {
    await addUser();

    const auth = await superoak(app);
    const res = await auth.post("/auth/test")
                            .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(";")[0];

    const test = await superoak(app);
    await test.get("/behavior/reporting/morning")
                .set("Cookie", cookie)
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect(`<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/behavior/reporting">Reporting</a></td>\n                    <td><a href="/behavior/summary">Summary</a></td>\n                    <td>Logged in as test@mail.net</td>\n                    <td><a href="/auth/logout"> Log out</a></td>\n                </table>\n                \n            </nav>\n<h1>Morning reporting</h1>\n<form method="POST" action="/behavior/reporting/morning">\n    \n    <div>\n        <label>Date: <input type="date" name="date" value="${getCurrentDate()}" /></label>\n    </div>\n    \n    <div>\n        <label>Sleep duration: <input type="number" name="sleepdur" step="0.1" value=""/></label>\n    </div>\n    \n    <p><strong>Sleep quality: </strong></p>\n    <div>\n        <label><input type="radio" name="sleepqual" value="1"  /> Very poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="sleepqual" value="2"  /> Poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="sleepqual" value="3"  /> Average</label>\n    </div>\n    <div>\n        <label><input type="radio" name="sleepqual" value="4"  /> Good</label>\n    </div>\n    <div>\n        <label><input type="radio" name="sleepqual" value="5"   /> Excellent</label>\n    </div>\n    \n    <p><strong>Generic mood: </strong></p>\n    <div>\n    <label><input type="radio" name="mood_m" value="1"  /> Very poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_m" value="2"  /> Poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_m" value="3"  /> Average</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_m" value="4"  /> Good</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_m" value="5"  /> Excellent</label>\n    </div>\n    <div>\n        <input type="submit" value="Submit!">\n    </div>\n</form>\n        </div>\n    </body>\n</html>`);
                
    await resetDatabase();
});

Deno.test("GET request to /behavior/reporting/evening should return the evening reporting form", async() => {
    await addUser();

    const auth = await superoak(app);
    const res = await auth.post("/auth/test")
                            .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(";")[0];

    const test = await superoak(app);
    await test.get("/behavior/reporting/evening")
                .set("Cookie", cookie)
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect(`<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/behavior/reporting">Reporting</a></td>\n                    <td><a href="/behavior/summary">Summary</a></td>\n                    <td>Logged in as test@mail.net</td>\n                    <td><a href="/auth/logout"> Log out</a></td>\n                </table>\n                \n            </nav>\n<h1>Evening reporting</h1>\n<form method="POST" action="/behavior/reporting/evening">\n    \n    <div>\n        <label>Date: <input type="date" name="date" value="${getCurrentDate()}" /></label>\n    </div>\n    \n    <div>\n        <label>Time spent on exercise: <input type="number" name="sports" step="0.1" value=""/></label>\n    </div>\n    \n    <div>\n        <label>Time spent on studying: <input type="number" name="studying" step="0.1" value=""/></label>\n    </div>\n    \n    <p><strong>Regularity and quality of eating: </strong></p>\n    <div>\n        <label><input type="radio" name="eating" value="1"  /> Very poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="eating" value="2"  /> Poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="eating" value="3"  /> Average</label>\n    </div>\n    <div>\n        <label><input type="radio" name="eating" value="4"  /> Good</label>\n    </div>\n    <div>\n        <label><input type="radio" name="eating" value="5"  /> Excellent</label>\n    </div>\n    \n    <p><strong>Generic mood: </strong></p>\n    <div>\n    <label><input type="radio" name="mood_e" value="1"  /> Very poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_e" value="2"  /> Poor</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_e" value="3"  /> Average</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_e" value="4"  /> Good</label>\n    </div>\n    <div>\n        <label><input type="radio" name="mood_e" value="5"  /> Excellent</label>\n    </div>\n    <div>\n        <input type="submit" value="Submit!">\n    </div>\n</form>\n        </div>\n    </body>\n</html>`);
                
    await resetDatabase();
});