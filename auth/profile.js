import { authConfig } from "../config/msalConfig.js";
import redirectToAuthCodeUrl from "../helper/redirect-to-authCodeUrl.js";

const profile = async function (context) {
  context.log("Auth-EditProfile function processed a request.");

  const authCodeUrlRequestParams = {
    authority: authConfig.policies.editProfile,
  };

  const authCodeRequestParams = {
    stage: authConfig.stages.profile,
  };

  return redirectToAuthCodeUrl(
    context,
    authCodeUrlRequestParams,
    authCodeRequestParams
  );
};

export default profile;
