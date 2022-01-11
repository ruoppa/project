import { Client, Pool } from "../deps.js";
import { config } from "../config/config.js"

/* For one reason or the other, using connection pools on the tests
 * leaks async ops (as many leaked ops as there are pool connections
 * so in my case, 5) This causes the first test to always fail,
 * eventhough it would pass fine otherwise and the application works
 * as expected. For this reason I use only one client when testing
 * instead of a connection pool
 */

const testing = Deno.env.get("TEST_ENVIRONMENT")

let connectionPool = ""

if (!testing) {
    connectionPool = new Pool(config.database, 5);
}

const createClient = () => {
    return new Client(config.database);
}

const executeQuery = async(query, ...args) => {
    if (testing) {
        const client = createClient();
        try {
            await client.connect();
            return await client.query(query, ...args);
        } catch (e) {
            console.log(e);
        } finally {
            await client.end();
        }
    } else {
        const client = await connectionPool.connect();
        try {
            return await client.query(query, ...args);
        } catch (e) {
            console.log(e);  
        } finally {
            await client.release();
        }
    }

}

export { executeQuery };