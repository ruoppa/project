import { bcrypt } from "../../deps.js";
import { getUsers, addUser } from "../../services/authService.js";
import { validate, required, minLength, isEmail } from "../../deps.js";

let authData = {
    email: "",
    password: "",
    again: "",
    errors: {}
};

let invalid = false;

let seenErrors = true;

const validationRules = {
    email: [required, isEmail],
    password: [required, minLength(4)]
};

const getData = async(request) => {
    const data = {
        email: "",
        password: "",
        again: "",
        errors: {}
    };

    if (request) {
        const params = await request.body().value;
        if (!params) {
            return data;
        }
        if (params.has("email")) {
            data.email = params.get("email");
        }
        if (params.has("password")) {
            data.password = params.get("password");
        }
        if (params.has("again")) {
            data.again = params.get("again");
        }
    }
    return data;
}

const resetData = () => {
    authData.email = "";
    authData.password = "";
    authData.again = "";
    authData.errors = {};
}

const showRegistration = async({render, session}) => {
    if (seenErrors) {
        resetData();
    }
    const auth = await session.get("auth");
    let user = {};
    if (auth) {
        user = await session.get("user");
    }
    authData.user = user;
    render("./auth/register.ejs", authData);
    if (!seenErrors) {
        seenErrors = true;
    }
}

const showLogin = async({render, session}) => {
    const auth = await session.get("auth");
    let user = {};
    if (auth) {
        user = await session.get("user");
    }
    render("./auth/login.ejs", { invalid: invalid, user: user });
    invalid = false;
}

/* Posts the registration form, adding a new user to the database in
 * the process. In case of validation errors, the fpopulated form is
 * shown along with error messages
 */
const postRegistration = async({request, response}) => {
    resetData();

    const data = await getData(request);
    const [passes, errors] = await validate(data, validationRules);

    if (!passes || data.password !== data.again) {
        if (data.password !== data.again) {
            if (errors.password) {
                errors.password.isSame = "the entered passwords do not match";
            } else {
                errors.password = { isSame: "the entered passwords do not match" };
            }
        }
        data.errors = errors;
        authData = data;
        seenErrors = false;
        response.redirect("/auth/register");
        return;
    }

    const existingUsers = await getUsers(data.email);
    if (existingUsers.rowCount > 0) {
        errors.email = {};
        errors.email.isReserved = "the entered email is already reserved";
        data.errors = errors;
        authData = data;
        seenErrors = false;
        response.redirect("/auth/register");
        return;
    }

    const hashedPw = await bcrypt.hash(data.password);
    await addUser(data.email, hashedPw);
    response.redirect("/auth/login");
}

/* Posts the login form and redirects the user to /, or in case
 * of validation errors, shows the login form again with an error
 * message. In this case the form is not populated
 */
const postLogin = async({request, response, session}) => {
    invalid = false;
    const body = request.body();
    const params = await body.value;
    
    if (!params) {
        invalid = true;
        response.redirect("/auth/login");
        return;
    }

    const email = params.get("email");
    const password = params.get("password");

    if (!email || !password) {
        invalid = true;
        response.redirect("/auth/login");
        return;
    }

    const res = await getUsers(email);
    if (!res || res.rowCount === 0) {
        invalid = true;
        response.redirect("/auth/login");
        return;
    }

    const user = res.rowsOfObjects()[0];
    const correct = await bcrypt.compare(password, user.password);
    if (!correct) {
        invalid = true;
        response.redirect("/auth/login");
        return;
    }

    await session.set("auth", true);
    await session.set("user", {
        id: user.id,
        email: user.email
    });
    response.redirect("/");
}

// Logs out the user, then redirects to home
const logOut = async({response, session}) => {
    await session.set("user", undefined);
    await session.set("auth", false);
    response.redirect("/");
}

// Authorizes the user. For testing purposes only
const authTest = async({session, response}) => {
    await session.set("auth", true);
    await session.set("user", {
        id: 1,
        email: "test@mail.net"
    });
    response.status = 200;
}

export { showRegistration, showLogin, postRegistration, postLogin, logOut, authTest };
