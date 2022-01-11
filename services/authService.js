import { executeQuery } from "../database/database.js";

const getUsers = async(email) => {
    const users = await executeQuery("SELECT * FROM users WHERE email = $1;", email);
    return users;
}

const addUser = async(email, password) => {
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, password);
}

export { getUsers, addUser }; 