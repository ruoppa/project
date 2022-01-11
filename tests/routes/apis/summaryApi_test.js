import { app } from "../../../app.js";
import { superoak } from "../../../deps.js";
import { executeQuery } from "../../../database/database.js";
import { getCurrentDate, getYesterday } from "../../../services/utilService.js";

Deno.test("GET request to /api/summary should return an empty JSON document when there is no data", async() => {
    const test = await superoak(app);
    await test.get("/api/summary")
                .expect(200)
                .expect("content-length", "2")
                .expect("content-type", "application/json; charset=utf-8")
                .expect("{}");
});

Deno.test("GET request to /api/summary/:year/:month/:day should return an empty JSON document when there is no data", async() => {
    const year = Math.floor(Math.random() * 2200) + 1;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const test = await superoak(app);
    await test.get(`/api/summary/${year}/${month}/${day}`)
                .expect(200)
                .expect("content-length", "2")
                .expect("content-type", "application/json; charset=utf-8")
                .expect("{}");
});

Deno.test("GET request to /api/summary should return a summary of the last seven days when there is data", async() => {
    // Create 2 users into the database
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", "test1@mail.com", "salasana");
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", "test2@mail.com", "salasana");

    /* I first tried this using random values, but the problem was
     * that due to the way decimal numbers work in javascript and sql
     * you can never quarantee that the tests will pass. Since
     * the api rounds that averages this will sometimes result in
     * the expected value calculated with javascript to be of by
     * ~0.01 Maybe there is a fix for this problem, but I don't have
     * enought time to find out
     */
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5);", getCurrentDate(), 1, 3, 5, 1);
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5);", getCurrentDate(), 2, 3, 4, 5);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", getCurrentDate(), 1, 12, 0, 1, 1);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", getYesterday(), 2, 3, 0, 2, 5);

    const test = await superoak(app);
    await test.get("/api/summary")
                .expect(200)
                .expect("content-type", "application/json; charset=utf-8")
                .expect(`{"mood":"2.0","sleep_duration":"2.0","sleep_quality":"3.0","eating":"1.0","sports":"5.0","studying":"0.0"}`);
    /* Note that in case the test doesn't pass, the following code is
     * never executed. This means that you will have to personally
     * delete the inserted values from the test database. I am aware
     * that this is not a very optimal solution, but testing functions
     * that use databases was never really discussed during the course
     * so I do not know a better way to do this (though I'm sure there
     * is one)
     */
    await executeQuery("DELETE FROM morning WHERE date IS NOT NULL;");
    await executeQuery("DELETE FROM evening WHERE date IS NOT NULL;");
    await executeQuery("DELETE FROM users WHERE id IS NOT NULL;");
    // Resets the serial counter for user id
    await executeQuery("SELECT SETVAL((SELECT pg_get_serial_sequence('users', 'id')), 1, false);")
});

Deno.test("GET request to /api/summary/:year/:month/:day should return a summary of the given day when there is data", async() => {
    // Create 2 users into the database
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", "test1@mail.com", "salasana");
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", "test2@mail.com", "salasana");
    // Add some data
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5);", getCurrentDate(), 1, 3, 5, 1);
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5);", getCurrentDate(), 2, 3, 4, 5);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", getCurrentDate(), 1, 12, 0, 1, 1);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", getYesterday(), 2, 3, 0, 2, 5);

    const dateArr = getCurrentDate().split("-");
    const year = dateArr[0];
    const month = dateArr[1];
    const day = dateArr[2];

    const test = await superoak(app);
    await test.get(`/api/summary/${year}/${month}/${day}`)
                .expect(200)
                .expect("content-type", "application/json; charset=utf-8")
                .expect(`{"mood":"1.75","sleep_duration":"3.0","sleep_quality":"4.5","eating":"0.5","sports":"6.0","studying":"0.0"}`);

    await executeQuery("DELETE FROM morning WHERE date IS NOT NULL;");
    await executeQuery("DELETE FROM evening WHERE date IS NOT NULL;");
    await executeQuery("DELETE FROM users WHERE id IS NOT NULL;");
    // Resets the serial counter for user id
    await executeQuery("SELECT SETVAL((SELECT pg_get_serial_sequence('users', 'id')), 1, false);")
});