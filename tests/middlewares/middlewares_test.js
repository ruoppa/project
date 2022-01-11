import { app } from "../../app.js";
import { superoak } from "../../deps.js";

/* These tests are all for the checkAuthMiddleware. Firstly, because the
 * other middleware can not be meaningfully tested and secondly because
 * it is vital that the middleware works correctly, so that unoauthorized
 * users can not 1. access the reporting and summary paths and 2. possibly
 * even access other users' data
 */
Deno.test("Requests to paths that are not /, /auth or /api, should be redirected to login, when the user is not logged in", async() => {
    const test = await superoak(app);
    await test.get("/behavior/reporting")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Login</h1>\n<form method="POST" action="/auth/login">\n    \n    <div>\n        <input type="email" name="email" placeholder="email" />\n    </div>\n    <div>\n        <input type="password" name="password" placeholder="password" />\n    </div>\n    <div>\n        <input type="submit" value="Login!" />\n    </div>\n</form>\n        </div>\n    </body>\n</html>');
    
    const test2 = await superoak(app);
    await test2.get("/behavior/reporting/morning")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Login</h1>\n<form method="POST" action="/auth/login">\n    \n    <div>\n        <input type="email" name="email" placeholder="email" />\n    </div>\n    <div>\n        <input type="password" name="password" placeholder="password" />\n    </div>\n    <div>\n        <input type="submit" value="Login!" />\n    </div>\n</form>\n        </div>\n    </body>\n</html>');
    
    const test3 = await superoak(app);
    await test3.get("/behavior/reporting/summary")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Login</h1>\n<form method="POST" action="/auth/login">\n    \n    <div>\n        <input type="email" name="email" placeholder="email" />\n    </div>\n    <div>\n        <input type="password" name="password" placeholder="password" />\n    </div>\n    <div>\n        <input type="submit" value="Login!" />\n    </div>\n</form>\n        </div>\n    </body>\n</html>');
});

Deno.test("Requests to / should not be redirected when the user is not logged in", async() => {
    const test = await superoak(app);
    await test.get("/")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Behavior logger</h1>\n<p>The purpose of the application is to log the users behavior day by day. You can report your behavior on the reporting page and view summaries on the summary page.</p>\n<div>\n    <p><strong>Average mood today: </strong>No data for today</p>\n</div>\n<div>\n    <p><strong>Average mood yesterday: </strong>No data for yesterday</p>\n</div>\n<div>\n    \n</div>\n');

    const test2 = await superoak(app);
    await test2.post("/")
                .expect(404);
});

Deno.test("Requests to /api should not be redirected when the user is not logged in", async() => {
    const test = await superoak(app);
    await test.get("/api/summary")
                .expect(200)
                .expect("content-length", "2")
                .expect("content-type", "application/json; charset=utf-8")
                .expect("{}");

    const test2 = await superoak(app);
    await test2.get("/api")
                .expect(404);
});

Deno.test("Requests to paths starting with /auth should not be redirected when the user is not logged in", async() => {
    const test = await superoak(app);
    await test.get("/auth/register")
                .expect(200)
                .expect("content-type", "text/html; charset=utf-8")
                .expect('<!DOCTYPE html>\n<html>\n    <head>\n        <title>Behavior logger</title>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n    </head>\n    <body>\n        <div class="container">\n            <nav>\n                \n                <table>\n                    <td><a href="/">Home</a></td>\n                    <td><a href="/auth/login">Log in</a></td>\n                    <td><a href="/auth/register">Register</a></td>\n                </table>\n                \n            </nav>\n<h1>Register</h1>\n<form method="POST" action="/auth/register">\n    \n    <div>\n        <input type="email" name="email" placeholder="email" value="" />\n    </div>\n    \n    <div>\n        <input type="password" name="password" placeholder="password" />\n    </div>\n    <div>\n        <input type="password" name="again" placeholder="repeat password" />\n    </div>\n    <div>\n        <input type="submit" value="Submit!" />\n    </div>\n</form>\n        </div>\n    </body>\n</html>');
});