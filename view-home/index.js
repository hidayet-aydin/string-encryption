import { isSession, setSession } from "../helper/session-handler.js";
import render from "../helper/html-render.js";

import { authConfig } from "../config/msalConfig.js";

export default async function (context, req) {
  context.log("Home-Page function processed a request.");

  const newCookies = [];
  let isAuthenticated = false;
  let session = await isSession(context, { isAuth: true });
  if (session && session.isAuthenticated) {
    isAuthenticated = true;
  } else {
    session = {
      isAuthenticated,
    };
    const session_id = await setSession(context, session);
    newCookies.push({
      name: "session.id",
      value: session_id,
    });
  }

  const homePage = await render("./views/home.html", {
    resourcePath: process.env["RESOURCE_PATH"],
    redirectUrl: process.env["CONFIG_HOME_URI"],
    app: authConfig.app,
    isAuthenticated,
    results: JSON.stringify(session || {}),
  });

  return (context.res = {
    status: 200,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
    },
    cookies: newCookies,
    body: homePage,
  });
}
