import cookie from "cookie";
import {
  CryptoProvider,
  ConfidentialClientApplication,
} from "@azure/msal-node";

import { msalConfig, authConfig } from "../config/msalConfig.js";
import {
  setSession,
  isSession,
  updateSession,
  delSession,
} from "./session-handler.js";

/**
 * Prepares the auth code request parameters and initiates the first leg of auth code flow
 * @param {object} context: az function context
 * @param {object} authCodeUrlRequestParams: parameters for requesting an auth code url
 * @param {object} authCodeRequestParams: parameters for requesting tokens using auth code
 */
const redirectToAuthCodeUrl = async (
  context,
  authCodeUrlRequestParams,
  authCodeRequestParams
) => {
  const cookies = cookie.parse(context.req.headers.cookie || "");
  let session_id = cookies["session.id"];

  const cryptoProvider = new CryptoProvider();
  const csrfToken = cryptoProvider.createNewGuid(); // create a GUID for csrf
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

  const pkceCodes = {
    challengeMethod: "S256",
    verifier: verifier,
    challenge: challenge,
  };

  const authCodeUrlRequest = {
    state: cryptoProvider.base64Encode(
      // encode the state param
      JSON.stringify({
        csrfToken,
        redirectTo: authConfig.url.home,
        stage: authCodeRequestParams.stage,
      })
    ),
    redirectUri: authConfig.url.redirect,
    responseMode: "form_post", // recommended for confidential clients
    codeChallenge: pkceCodes.challenge,
    codeChallengeMethod: pkceCodes.challengeMethod,
    codeVerifier: pkceCodes.verifier,
    ...authCodeUrlRequestParams,
  };

  const authCodeRequest = {
    redirectUri: authConfig.url.redirect,
    code: "",
    ...authCodeRequestParams,
  };

  try {
    let session;
    switch (authCodeRequestParams.stage) {
      case authConfig.stages.login:
        if (session_id) {
          await delSession(context, session_id);
        }
        session_id = await setSession(context, {
          pkceCodes,
          authCodeUrlRequest,
          authCodeRequest,
        });
        break;

      case authConfig.stages.reset:
        session = (await isSession(context)) || {};
        if (!session) {
          context.log.error("session is missing");
          return {
            status: 302,
            headers: {
              location: authConfig.url.home,
            },
          };
        }
        break;

      default: // token, profile
        session = (await isSession(context, { isAuth: true })) || {};
        if (!session) {
          context.log.error("session is missing");
          return {
            status: 302,
            headers: {
              location: authConfig.url.home,
            },
          };
        }
        session = {
          ...session,
          pkceCodes,
          authCodeUrlRequest,
          authCodeRequest,
        };
        await updateSession(context, session_id, session);
        break;
    }

    const msalInstance = new ConfidentialClientApplication(msalConfig);
    const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
      authCodeUrlRequest
    );

    return (context.res = {
      status: 302,
      headers: {
        location: authCodeUrlResponse,
      },
      cookies: [
        {
          name: "csrfToken",
          value: csrfToken,
        },
        {
          name: "session.id",
          value: session_id,
        },
      ],
    });
  } catch (error) {
    context.log.error(error.message);
    return {
      status: 302,
      headers: {
        location: authConfig.url.home,
      },
    };
  }
};

export default redirectToAuthCodeUrl;
