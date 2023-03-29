import cookie from "cookie";

import { authConfig } from "../config/msalConfig.js";
import { delSession } from "../helper/session-handler.js";

const signout = async function (context) {
  context.log("Auth-SignOut function processed a request.");

  const cookies = cookie.parse(context.req.headers.cookie || "");
  if ("session.id" in cookies) {
    await delSession(context, cookies["session.id"]);
  }

  try {
    return {
      status: 302,
      headers: {
        location: authConfig.url.logout,
      },
    };
  } catch (error) {
    context.log.error(error);
    return {
      status: 302,
      headers: {
        location: authConfig.url.home,
      },
    };
  }
};

export default signout;
