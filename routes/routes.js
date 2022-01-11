import { Router } from "../deps.js";
import { showRegistration, showLogin, postRegistration, postLogin, logOut, authTest } from "./controllers/authController.js";
import { showMorning, showEvening, postMorning, postEvening, showReporting } from "./controllers/reportController.js";
import { showLanding, showSummary, postSummary } from "./controllers/summaryController.js";
import { lastSevenApi, givenDayApi } from "./apis/summaryApi.js";

const router = new Router();

// Authorization
router.get("/auth/register", showRegistration)
      .post("/auth/register", postRegistration)
      .get("/auth/login", showLogin)
      .post("/auth/login", postLogin)
      .get("/auth/logout", logOut);
// Testing
if (Deno.env.get('TEST_ENVIRONMENT')) {
      router.post("/auth/test", authTest);
}
// Reporting
router.get("/behavior/reporting", showReporting)
      .get("/behavior/reporting/morning", showMorning)
      .get("/behavior/reporting/evening", showEvening)
      .post("/behavior/reporting/morning", postMorning)
      .post("/behavior/reporting/evening", postEvening);
// Summary
router.get("/", showLanding)
      .get("/behavior/summary", showSummary)
      .post("/behavior/summary", postSummary);
// Api
router.get("/api/summary", lastSevenApi)
      .get("/api/summary/:year/:month/:day", givenDayApi);

export { router };