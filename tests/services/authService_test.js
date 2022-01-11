import { getUsers, addUser } from "../../services/authService.js";
import { executeQuery } from "../../database/database.js";
import { assertEquals, bcrypt } from "../../deps.js";

Deno.test("getUsers should return nothing when the parameter doesn't match an email in the database", async() => {
    const email = `${Math.floor(Math.random() * 999999) + 1}@mail.net`;
    const res = await getUsers(email);
    assertEquals(res.rowCount === 0, true);
});

Deno.test("getUsers should return the user with the email given as a parameter", async() => {
    const emailSeed = Math.floor(Math.random() * 999999) + 1;
    const email1 = `${emailSeed}@mail.net`;
    const password1 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);
    const email2 = `${emailSeed + Math.floor(Math.random() * 3456)}@mail.net`;
    const password2 = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2), ($3, $4);", email1, password1, email2, password2);

    const res1 = await getUsers(email1);
    const res2 = await getUsers(email2);

    assertEquals(res1.rowCount === 1, true);
    assertEquals(res2.rowCount === 1, true);

    const user1 = res1.rowsOfObjects()[0];
    const user2 = res2.rowsOfObjects()[0];

    assertEquals(user1.id, 1);
    assertEquals(user1.email, email1);
    assertEquals(user1.password, password1);
    assertEquals(user2.id, 2);
    assertEquals(user2.email, email2);
    assertEquals(user2.password, password2);

    // Delete the data added to the database
    await executeQuery("DELETE FROM users WHERE id IS NOT NULL;");
    // Resets the serial counter for user id
    await executeQuery("SELECT SETVAL((SELECT pg_get_serial_sequence('users', 'id')), 1, false);")
});

Deno.test("addUser should add a new user to the database with the given values as email and password", async() => {
    const email = `${Math.floor(Math.random() * 999999) + 1}@mail.net`;
    const password = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await addUser(email, password);

    const res = await executeQuery("SELECT * FROM users WHERE email = $1;", email);

    assertEquals (res.rowCount === 1, true);

    const user = res.rowsOfObjects()[0];

    assertEquals(user.id, 1);
    assertEquals(user.email, email);
    assertEquals(user.password, password);
});