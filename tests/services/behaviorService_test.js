import { getExistingMorn, getExistingEven, addToMorn, addToEven, summarizeWeek, summarizeMonth } from "../../services/behaviorService.js";
import { assertEquals, bcrypt } from "../../deps.js";
import { executeQuery } from "../../database/database.js";
import { resetDatabase } from "../util/testUtil.js";

Deno.test("getExistingMorn should return nothing when there is no matching data", async() => {
    // Random date
    const date = `${Math.floor(Math.random() * 200) + 1970}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;
    // Random user id
    const id = Math.floor(Math.random() * 2200) + 1;
    const res = await getExistingMorn(date, id);
    assertEquals(res.rowCount, 0);
});

Deno.test("getExistingMorn should return correct data", async() => {
    // Insert 2 random users into the database
    const emailSeed = Math.floor(Math.random() * 999999) + 1;
    const email1 = `${emailSeed}@mail.net`;
    const password1 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);
    const email2 = `${emailSeed + Math.floor(Math.random() * 3456)}@mail.net`;
    const password2 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2), ($3, $4);", email1, password1, email2, password2);

    // Insert random data for user 1 into the database
    const date = `${Math.floor(Math.random() * 200) + 1970}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;
    const sleepdur = `${Math.floor(Math.random() * 24) + 1}`;
    const sleepqual = `${Math.floor(Math.random() * 5) + 1}`;
    const mood = `${Math.floor(Math.random() * 5) + 1}`;

    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5)", date, 1, sleepdur, sleepqual, mood);

    const res1 = await getExistingMorn(date, 1);
    const res2 = await getExistingMorn(date, 2);

    assertEquals(res2.rowCount, 0);
    assertEquals(res1.rowCount, 1);

    const data = res1.rowsOfObjects()[0];

    assertEquals(data.user_id, 1);
    assertEquals(data.sleepdur, Number(sleepdur));
    assertEquals(data.sleepqual, Number(sleepqual));
    assertEquals(data.mood_m, Number(mood));

    await resetDatabase();
});

Deno.test("getExistingEven should return nothing when there is no matching data", async() => {
    // Random date
    const date = `${Math.floor(Math.random() * 2200) + 1970}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;
    // Random user id
    const id = Math.floor(Math.random() * 2200) + 1;
    const res = await getExistingEven(date, id);
    assertEquals(res.rowCount, 0);
});

Deno.test("getExistingEven should return correct data", async() => {
    // Insert 2 random users into the database
    const emailSeed = Math.floor(Math.random() * 999999) + 1;
    const email1 = `${emailSeed}@mail.net`;
    const password1 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);
    const email2 = `${emailSeed + Math.floor(Math.random() * 3456)}@mail.net`;
    const password2 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2), ($3, $4);", email1, password1, email2, password2);

    // Insert random data for user 1 into the database
    const date = `${Math.floor(Math.random() * 200) + 1970}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;
    const sports = `${Math.floor(Math.random() * 24) + 1}`;
    const studying = `${Math.floor(Math.random() * 24) + 1}`;
    const eating = `${Math.floor(Math.random() * 5) + 1}`;
    const mood = `${Math.floor(Math.random() * 5) + 1}`;

    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6)", date, 1, sports, studying, eating, mood);

    const res1 = await getExistingEven(date, 1);
    const res2 = await getExistingEven(date, 2);

    assertEquals(res2.rowCount, 0);
    assertEquals(res1.rowCount, 1);

    const data = res1.rowsOfObjects()[0];

    assertEquals(data.user_id, 1);
    assertEquals(data.sports, Number(sports));
    assertEquals(data.studying, Number(studying));
    assertEquals(data.eating, Number(eating));
    assertEquals(data.mood_e, Number(mood));

    await resetDatabase();
});

Deno.test("addToMorn should add the given data to the database", async() => {
    // Add a random user to the database
    const email = `${Math.floor(Math.random() * 999999) + 1}@mail.net`;
    const password = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, password);

    // Insert random data for user 1 into the database
    const date = `${Math.floor(Math.random() * 200) + 1970}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;
    const sleepdur = `${Math.floor(Math.random() * 24) + 1}`;
    const sleepqual = `${Math.floor(Math.random() * 5) + 1}`;
    const mood = `${Math.floor(Math.random() * 5) + 1}`;
    
    await addToMorn(date, 1, sleepdur, sleepqual, mood);

    const res = await executeQuery("SELECT * FROM morning WHERE user_id = $1 AND date = $2;", 1, date);

    assertEquals(res.rowCount, 1);
    
    const data = res.rowsOfObjects()[0];

    assertEquals(data.user_id, 1);
    assertEquals(data.sleepdur, Number(sleepdur));
    assertEquals(data.sleepqual, Number(sleepqual));
    assertEquals(data.mood_m, Number(mood));

    await resetDatabase();
});

Deno.test("addToEven should add the given data to the database", async() => {
    // Add a random user to the database
    const email = `${Math.floor(Math.random() * 999999) + 1}@mail.net`;
    const password = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, password);

    // Insert random data for user 1 into the database
    const date = `${Math.floor(Math.random() * 200) + 1970}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`;
    const sports = `${Math.floor(Math.random() * 24) + 1}`;
    const studying = `${Math.floor(Math.random() * 24) + 1}`;
    const eating = `${Math.floor(Math.random() * 5) + 1}`;
    const mood = `${Math.floor(Math.random() * 5) + 1}`;
    
    await addToEven(date, 1, sports, studying, eating, mood);

    const res = await executeQuery("SELECT * FROM evening WHERE user_id = $1 AND date = $2;", 1, date);

    assertEquals(res.rowCount, 1);
    
    const data = res.rowsOfObjects()[0];

    assertEquals(data.user_id, 1);
    assertEquals(data.sports, Number(sports));
    assertEquals(data.studying, Number(studying));
    assertEquals(data.eating, Number(eating));
    assertEquals(data.mood_e, Number(mood));

    await resetDatabase();
});

Deno.test("summarizeWeek should return an empty row when there is no data for the given week", async() => {
    const week = Math.floor(Math.random() * 52) + 1;
    const year = Math.floor(Math.random() * 200) + 1970;
    const id = Math.floor(Math.random() * 30) + 1;
    const res = await summarizeWeek(week, year, id);

    assertEquals(res.rowCount, 1);

    const data = res.rowsOfObjects()[0];

    assertEquals(data.mood, null);
    assertEquals(data.eating, null);
    assertEquals(data.studying, null);
    assertEquals(data.sleepdur, null);
    assertEquals(data.sleepqual, null);
    assertEquals(data.sports, null);
});

Deno.test("summarizeWeek should return a summary of the given week", async() => {
    // Insert 2 random users into the database
    const emailSeed = Math.floor(Math.random() * 999999) + 1;
    const email1 = `${emailSeed}@mail.net`;
    const password1 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);
    const email2 = `${emailSeed + Math.floor(Math.random() * 3456) + 1}@mail.net`;
    const password2 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2), ($3, $4);", email1, password1, email2, password2);

    const date1 = '2020-11-30';
    const date2 = '2020-12-3';
    
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5)", date1, 1, 4.5, 5, 3);
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5)", date2, 1, 8, 1, 2);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", date1, 1, 5, 5, 5, 5);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", date2, 1, 5, 5, 5, 5);
    /* The summarizeWeek function should only return the summary of the
     * user with the given id. Insert some data for another user to the
     * database to check that this is the case
     */
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", date1, 2, 12, 3, 1, 2);

    const res = await summarizeWeek(49, 2020, 1);

    assertEquals(res.rowCount, 1);

    const data = res.rowsOfObjects()[0];

    assertEquals(data.mood, "3.75");
    assertEquals(data.eating, "5.0");
    assertEquals(data.studying, "5.0");
    assertEquals(data.sleepdur, "6.25");
    assertEquals(data.sleepqual, "3.0");
    assertEquals(data.sports, "5.0");

    await resetDatabase();
});

Deno.test("summarizeMonth should return an empty row when there is no data for the given month", async() => {
    const month = Math.floor(Math.random() * 52) + 1;
    const year = Math.floor(Math.random() * 200) + 1970;
    const id = Math.floor(Math.random() * 30) + 1;
    const res = await summarizeMonth(month, year, id);

    assertEquals(res.rowCount, 1);

    const data = res.rowsOfObjects()[0];

    assertEquals(data.mood, null);
    assertEquals(data.eating, null);
    assertEquals(data.studying, null);
    assertEquals(data.sleepdur, null);
    assertEquals(data.sleepqual, null);
    assertEquals(data.sports, null);
});

Deno.test("summarizeMonth should return a summary of the given month", async() => {
    // Insert 2 random users into the database
    const emailSeed = Math.floor(Math.random() * 999999) + 1;
    const email1 = `${emailSeed}@mail.net`;
    const password1 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);
    const email2 = `${emailSeed + Math.floor(Math.random() * 3456) + 1}@mail.net`;
    const password2 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2), ($3, $4);", email1, password1, email2, password2);

    const date1 = '2020-11-30';
    const date2 = '2020-11-19';
    
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5)", date1, 1, 4.5, 5, 3);
    await executeQuery("INSERT INTO morning (date, user_id, sleepdur, sleepqual, mood_m) VALUES ($1, $2, $3, $4, $5)", date2, 1, 8, 1, 2);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", date1, 1, 5, 5, 5, 5);
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", date2, 1, 5, 5, 5, 5);
    /* The summarizeWeek function should only return the summary of the
     * user with the given id. Insert some data for another user to the
     * database to check that this is the case
     */
    await executeQuery("INSERT INTO evening (date, user_id, sports, studying, eating, mood_e) VALUES ($1, $2, $3, $4, $5, $6);", date1, 2, 12, 3, 1, 2);

    const res = await summarizeMonth(11, 2020, 1);

    assertEquals(res.rowCount, 1);

    const data = res.rowsOfObjects()[0];

    assertEquals(data.mood, "3.75");
    assertEquals(data.eating, "5.0");
    assertEquals(data.studying, "5.0");
    assertEquals(data.sleepdur, "6.25");
    assertEquals(data.sleepqual, "3.0");
    assertEquals(data.sports, "5.0");

    await resetDatabase();
});