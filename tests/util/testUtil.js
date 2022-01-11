import { executeQuery } from "../../database/database.js";
import { bcrypt } from "../../deps.js";

/* This file contains some convenience methods for testing purposes
 * e.g. adding a user to the database
 */

const addUser = async() => {
    // Add a random user to the database
    const email = "test@mail.net";
    const password = await bcrypt.hash(`${Math.floor(Math.random() * 999999) + 1}`);

    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, password);
}

const resetDatabase = async() => {
    // Delete the data added to the database
    await executeQuery("DELETE FROM morning WHERE date IS NOT NULL;");
    await executeQuery("DELETE FROM evening WHERE date IS NOT NULL;");
    await executeQuery("DELETE FROM users WHERE id IS NOT NULL;");
    // Resets the serial counter for user id
    await executeQuery("SELECT SETVAL((SELECT pg_get_serial_sequence('users', 'id')), 1, false);");
}

export { addUser, resetDatabase };
