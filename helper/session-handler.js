import cookie from "cookie";
import { v4 as uuidv4 } from "uuid";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

import { authConfig } from "../config/msalConfig.js";

const account = process.env.WEBSITE_ACCOUNT_NAME;
const accountKey = process.env.WEBSITE_ACCOUNT_KEY;

const getClient = () => {
  const credential = new AzureNamedKeyCredential(account, accountKey);
  const client = new TableClient(
    `https://${account}.table.core.windows.net`,
    "session",
    credential
  );

  return client;
};

const getSession = async (context, session_id) => {
  let result;
  try {
    result = await getClient().getEntity(authConfig.app.tag, session_id);
    result.payload = JSON.parse(result.payload);
    return result;
  } catch (error) {
    context.log.error(error.message);
    return;
  }
};

const setSession = async (context, payload) => {
  try {
    const rowKey = uuidv4();
    const newEntity = {
      partitionKey: authConfig.app.tag,
      rowKey,
      payload: JSON.stringify(payload),
    };
    await getClient().createEntity(newEntity);

    return rowKey;
  } catch (error) {
    context.log.error(error.message);
    return;
  }
};

const updateSession = async (context, session_id, payload) => {
  let result;
  try {
    const entity = {
      partitionKey: authConfig.app.tag,
      rowKey: session_id,
      payload: JSON.stringify(payload),
    };

    await getClient().updateEntity(entity, "Replace");
    return result;
  } catch (error) {
    context.log.error(error.message);
    return;
  }
};

const delSession = async (context, session_id) => {
  let result;
  try {
    result = await getClient().deleteEntity(authConfig.app.tag, session_id);
    return result;
  } catch (error) {
    context.log.error(error.message);
    return;
  }
};

const isSession = async (context, check) => {
  let session;
  const cookies = cookie.parse(context.req.headers.cookie || "");
  try {
    if ("session.id" in cookies) {
      const storege = await getSession(context, cookies["session.id"]);
      session = storege?.payload;
      if (!session) {
        context.log.warn("session.id was removed by server side");
        await delSession(context, cookies["session.id"]);
        return;
      }
    } else {
      context.log.warn("session.id not found");
      return;
    }

    if (session?.idTokenClaims?.exp) {
      const now = new Date();
      let exp = parseInt(session.idTokenClaims.exp);
      exp = new Date(exp * 1000);
      context.log.warn({ now, exp });
      if (now >= exp) {
        await delSession(context, cookies["session.id"]);
        context.log.warn("session expired");
        return;
      }
    }

    if (!session.isAuthenticated && check?.isAuth) {
      context.log.warn("session.id was removed by client side");
      await delSession(context, cookies["session.id"]);
      return;
    }

    return session;
  } catch (error) {
    context.log.error(error.message);
    return;
  }
};

export { getSession, setSession, updateSession, isSession, delSession };
