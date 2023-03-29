import { authConfig } from "../config/msalConfig.js";
import redirectToAuthCodeUrl from "../helper/redirect-to-authCodeUrl.js";

const token = async function (context) {
  context.log("Auth-Token function processed a request.");

  const scopes = [
    "openid",
    "offline_access",
    // "https://ytuworkshop.onmicrosoft.com/example-api/Task.Read",
  ];

  const authCodeUrlRequestParams = {
    authority: authConfig.policies.signUpSignIn,
    scopes,
  };

  const authCodeRequestParams = {
    stage: authConfig.stages.token,
    scopes,
  };

  return redirectToAuthCodeUrl(
    context,
    authCodeUrlRequestParams,
    authCodeRequestParams
  );
};

export default token;
