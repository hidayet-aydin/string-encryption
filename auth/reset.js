import { authConfig } from "../config/msalConfig.js";
import redirectToAuthCodeUrl from "../helper/redirect-to-authCodeUrl.js";

const reset = async function (context) {
  context.log("Auth-Reset function processed a request.");

  const authCodeUrlRequestParams = {
    authority: authConfig.policies.resetPassword,
  };

  const authCodeRequestParams = {
    stage: authConfig.stages.reset,
  };

  return redirectToAuthCodeUrl(
    context,
    authCodeUrlRequestParams,
    authCodeRequestParams
  );
};

export default reset;
