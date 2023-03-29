import { authConfig } from "../config/msalConfig.js";
import redirectToAuthCodeUrl from "../helper/redirect-to-authCodeUrl.js";

const signin = async function (context) {
  context.log("Auth-SignIn function processed a request.");

  const scopes = ["openid", "offline_access"];

  const authCodeUrlRequestParams = {
    authority: authConfig.policies.signUpSignIn,
    scopes,
  };

  const authCodeRequestParams = {
    isAuthenticated: false,
    stage: authConfig.stages.login,
    scopes,
  };

  return redirectToAuthCodeUrl(
    context,
    authCodeUrlRequestParams,
    authCodeRequestParams
  );
};

export default signin;
