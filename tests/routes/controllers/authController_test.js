import { app } from "../../../app.js";
import { superoak, bcrypt } from "../../../deps.js";

Deno.test("GET request to /auth/login should return the login page", async() => {
    const test = await superoak(app);
    await test.get("/auth/login")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Login</h1>\n<form method="POST" action="/auth/login">\n    \n    <div>\n        <input type="email" name="email" placeholder="email" />\n    </div>\n    <div>\n        <input type="password" name="password" placeholder="password" />\n    </div>\n    <div>\n        <input type="submit" value="Login!" />\n    </div>\n</form>\n        </div>\n    </body>\n</html>');
});

Deno.test("GET request to /auth/register should return the register page", async() => {
    const test = await superoak(app);
    await test.get("/auth/register")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Register</h1>\n<form method="POST" action="/auth/register">\n    \n    <div>\n        <input type="email" name="email" placeholder="email" value="" />\n    </div>\n    \n    <div>\n        <input type="password" name="password" placeholder="password" />\n    </div>\n    <div>\n        <input type="password" name="again" placeholder="repeat password" />\n    </div>\n    <div>\n        <input type="submit" value="Submit!" />\n    </div>\n</form>\n        </div>\n    </body>\n</html>');
});