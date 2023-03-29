import { authConfig } from "../config/msalConfig.js";

import profile from "./profile.js";
import reset from "./reset.js";
import signin from "./signin.js";
import signout from "./signout.js";
import redirect from "./redirect.js";
import token from "./token.js";

export default async function (context) {
  const route = context.req.params.route;
  //   const path = context.req.params.path;
  let result = {
    status: 302,
    headers: {
      location: authConfig.url.home,
    },
  };

  const routes = {
    GET: {
      [authConfig.route.signin]: signin,
      [authConfig.route.token]: token,
      [authConfig.route.profile]: profile,
      [authConfig.route.signout]: signout,
      [authConfig.route.reset]: reset,
    },
    POST: {
      [authConfig.route.redirect]: redirect,
    },
  };

  const authFunc = routes[context.req.method]["/auth/" + route];
  if (authFunc) {
    result = (await authFunc(context)) || result;
  } else {
    context.log.warn("wrong url (404)");
  }

  return result;
}
