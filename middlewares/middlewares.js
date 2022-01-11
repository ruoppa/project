const errorMiddleware = async(context, next) => {
    try {
        await next();
    } catch (e) {
        console.log(e);
    }
  }
  
const requestInfoMiddleware = async({request, session}, next) => {
    const now = new Date();
    let id = "anonymous";
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()} - ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;

    if (await session.get("auth")) {
        const user = await session.get("user");
        id = user.id;
    }

    console.log(`${request.method} request to ${request.url.pathname} by ${id} at ${time}`);
    await next();
}

/* On each request made to a path that is not either login/registration
 * or made to the root, the middleware will check if the user is logged
 * in. If the user is logged in, the request will be carried out, otherwise
 * the user will be redirected to login
 */
const checkAuthMiddleware = async({request, session, response}, next) => {
    if (!request.url.pathname.startsWith("/auth") && request.url.pathname !== "/" && !request.url.pathname.startsWith("/api")) {
        if (await session.get("auth")) {
            await next();
        } else {
            response.redirect("/auth/login");
        }
    } else {
        await next();
    }
}

export { errorMiddleware, requestInfoMiddleware, checkAuthMiddleware };