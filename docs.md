# Database create table statements

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(320) NOT NULL,
      password CHAR(60) NOT NULL
    );

    CREATE UNIQUE INDEX ON users((lower(email)));

    CREATE TABLE morning (
      date DATE,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      sleepdur REAL NOT NULL,
      sleepqual INTEGER NOT NULL,
      mood_m INTEGER NOT NULL,
      PRIMARY KEY(date, user_id)
    );

    CREATE TABLE evening (
      date DATE,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      sports REAL NOT NULL,
      studying REAL NOT NULL,
      eating INTEGER NOT NULL,
      mood_e INTEGER NOT NULL,
      PRIMARY KEY(date, user_id)
    );

# Running the application

Note that the database credentials are read from environmental variables. Execute the following command in
the directory the application is stored in:  

    PGHOST=”hostname-here" PGDATABASE="database-name-here" PGPASSWORD="database-password-here" deno run --allow-net --allow-env --allow-read --unstable app.js

# Running the tests

I would personally recommend using a seperate database for running the tests. If you wish to use the same
database for running the application and the tests, make sure the database is empty (as in it only contains
the necessary tables with no data) before running the tests, as the tests will otherwise most likely fail.
Because the users table uses serial type for the id attribute, simply deleting all the data from the tables
is not enough to completely reset the database. One can use for example the following commands (assuming
that you have not manually inserted data to the database, only through the application):

    DELETE FROM morning WHERE date IS NOT NULL;
    DELETE FROM evening WHERE date IS NOT NULL;
    DELETE FROM users WHERE id IS NOT NULL;
    SELECT SETVAL((SELECT pg_get_serial_sequence('users', 'id')), 1, false);

One could also simply drop the tables and then execute the create table statements again. The create table
statements for the test database are the same as for the application database. Note that if the tests were
to fail (this could happen e.g. if one alters the source code) you will most likely have to manually reset
the database. To run the tests execute the following command in the directory the application is stored in:

    TEST_ENVIRONMENT=true PGHOST="hostname-here" PGDATABASE="database-name-here" PGPASSWORD=”database-password-here" deno test --allow-net --allow-env --allow-read --unstable

# Application (hopefully) available at

The application should also be available online at:  
<https://behaviorlogger.herokuapp.com>

# About handling duplicate reports

Functionality for handling duplicate reports: page simply shows a validation error if the user attempts to
submit for a day they already submitted data for. In my opinion it makes more sense to prevent submitting
duplicate reports than to overwrite old ones. The best solution would be to present the user with a warning
message asking whether they are sure they want to overwrite existing data when they are trying to submit
duplicate reports, however I lack the skills to implement such functionality. Furthermore I’m quite certain
that the requirement for the application to update the values when trying to submit a duplicate report was
added later on. I had already implemented the duplicate report handling functionality differently when I
noticed and I really didn’t feel like changing it at that point.

# About averages

If the user has submitted data for a certain date only partially (only morning or only evening) the missing
values are considered as zeros in the calculation of averages. For example, if the user has submitted data
for the following dates:  
10.12.2020 morning  
10.12.2020 evening  
11.12.2020 morning  
and let’s say the mood on 10.12.2020 was 3 in the morning and 5 in the evening and on 11.12.2020 2 in the
morning. The average mood will then be (3 + 5 + 2 + 0) / 4 = 2.5
