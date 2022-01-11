import { Application, viewEngine, engineFactory, adapterFactory, Session, oakCors } from "./deps.js";
import { router } from "./routes/routes.js";
import { errorMiddleware, requestInfoMiddleware, checkAuthMiddleware } from "./middlewares/middlewares.js";

const app = new Application();

const session = new Session({ framework: "oak" });
await session.init();
// Max age of session is one day
app.use(session.use()(session, { maxAge: 60*60*24 } ));

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views"
}));

app.use(errorMiddleware);
app.use(requestInfoMiddleware);
app.use(checkAuthMiddleware);

app.use(oakCors());
app.use(router.routes());

let port = 7777;
if (Deno.args.length > 0) {
    const lastArgument = Deno.args[Deno.args.length - 1];
    port = Number(lastArgument);
}

if (!Deno.env.get('TEST_ENVIRONMENT')) {
    app.listen({ port: port });
}

export { app };