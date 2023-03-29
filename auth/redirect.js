import cookie from "cookie";
import {
  CryptoProvider,
  ConfidentialClientApplication,
} from "@azure/msal-node";

import { msalConfig, authConfig } from "../config/msalConfig.js";
import { isSession, updateSession } from "../helper/session-handler.js";

const redirect = async function (context) {
  context.log("Auth-Redirect function processed a request.");

  const cookies = cookie.parse(context.req.headers.cookie || "");
  let session = await isSession(context);
  if (!session) {
    context.log.error("redirect error - session is missing");
    return {
      status: 302,
      headers: {
        location: authConfig.url.home,
      },
    };
  }

  let state;
  const bodyParams = new URLSearchParams(context.req.body);
  const payload = Object.fromEntries(bodyParams);
  if (payload.state) {
    const cryptoProvider = new CryptoProvider();
    state = JSON.parse(cryptoProvider.base64Decode(payload.state));
  } else {
    context.log.error("state is missing");
    return {
      status: 302,
      headers: {
        location: authConfig.url.home,
      },
    };
  }

  if (state.csrfToken !== cookies.csrfToken) {
    context.log.error("csrf token does not match");
    return {
      status: 302,
      headers: {
        location: authConfig.url.home,
      },
    };
  }

  try {
    const authCodeRequest = {
      ...session.authCodeRequest,
      code: payload.code, // authZ code
      isAuthenticated: true,
      codeVerifier: session.pkceCodes.verifier, // PKCE Code Verifier
    };

    const msalInstance = new ConfidentialClientApplication(msalConfig);
    // context.log.warn("token-authCodeRequest", authCodeRequest);
    const tokenResponse = await msalInstance.acquireTokenByCode(
      authCodeRequest
    );
    context.log.warn("token-tokenResponse", JSON.stringify(tokenResponse));
    const account = { ...tokenResponse.account };
    const idTokenClaims = { ...account.idTokenClaims };
    delete account.idTokenClaims;

    switch (state.stage) {
      case authConfig.stages.login || authConfig.stages.profile:
        session = {
          // ...session,
          ...tokenResponse,
          authCodeRequest,
          account,
          accessToken: tokenResponse.accessToken,
          idToken: tokenResponse.idToken,
          idTokenClaims,
          isAuthenticated: true,
        };
        break;

      case authConfig.stages.token:
        session = {
          ...session,
          // ...tokenResponse,
          // authCodeRequest,
          // account,
          accessToken: tokenResponse.accessToken,
          // idToken: tokenResponse.idToken,
          // idTokenClaims,
          // isAuthenticated: true,
        };
        break;
    }

    session = Object.keys(session)
      .sort()
      .reduce((obj, key) => {
        obj[key] = session[key];
        return obj;
      }, {});
    await updateSession(context, cookies["session.id"], session);

    return {
      status: 302,
      headers: {
        location: state.redirectTo,
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

export default redirect;
