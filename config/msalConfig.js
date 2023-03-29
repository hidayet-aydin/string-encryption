import { LogLevel } from "@azure/msal-node";

const TENANT_ID = process.env.APP_TENANT_ID;
const TENANT_NAME = process.env.APP_TENANT_NAME;
const POLICY_URL = `https://${TENANT_NAME}.b2clogin.com/${TENANT_NAME}.onmicrosoft.com`;

const authConfig = {
  app: {
    name: process.env.CONFIG_APP_NAME,
    env: process.env.MODE,
    tag: `${process.env.CONFIG_APP_NAME}-${process.env.MODE}`,
  },
  auth: {
    clientId: process.env.APP_CLIENT_ID, // Application (client) ID
    clientSecret: process.env.APP_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
  },
  route: {
    signin: process.env.CONFIG_LOGIN_URI,
    token: process.env.CONFIG_GET_TOKEN_URI,
    redirect: process.env.CONFIG_REDIRECT_URI,
    profile: process.env.CONFIG_PROFILE_EDIT_URI,
    signout: process.env.CONFIG_LOGOUT_URI,
    reset: process.env.CONFIG_RESET_PASSWORD_URI,
  },
  url: {
    home: `${process.env.CONFIG_HOSTNAME}${process.env.CONFIG_HOME_URI}`,
    login: `${process.env.CONFIG_HOSTNAME}${process.env.CONFIG_LOGIN_URI}`,
    redirect: `${process.env.CONFIG_HOSTNAME}${process.env.CONFIG_REDIRECT_URI}`,
    logout: `${POLICY_URL}/${process.env.POLICY_SIGNUP_SIGNIN}/oauth2/v2.0/logout?post_logout_redirect_uri=${process.env.CONFIG_HOSTNAME}${process.env.CONFIG_HOME_URI}`,
    logoutRedirect: `${process.env.CONFIG_HOSTNAME}${process.env.CONFIG_LOGOUT_REDIRECT_URI}`,
  },
  policies: {
    tenant: `https://login.microsoftonline.com/${TENANT_ID}`, // https://login.microsoftonline.com/<tenant>
    signUpSignIn: `${POLICY_URL}/${process.env.POLICY_SIGNUP_SIGNIN}`,
    editProfile: `${POLICY_URL}/${process.env.POLICY_EDIT_PROFILE}`,
    resetPassword: `${POLICY_URL}/${process.env.POLICY_RESET_PASSWORD}`,
  },
  stages: {
    login: "login",
    logout: "logout",
    profile: "edit_profile",
    reset: "reset_password",
    token: "get_token",
  },
};

const msalConfig = {
  auth: {
    clientId: authConfig.auth.clientId,
    authority: authConfig.policies.signUpSignIn,
    clientSecret: authConfig.auth.clientSecret,
    knownAuthorities: [`${TENANT_NAME}.b2clogin.com`],
    redirectUri: authConfig.url.redirect,
    validateAuthority: false,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    },
  },
};

export { authConfig, msalConfig };
