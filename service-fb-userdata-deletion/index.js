import crypto from "crypto";

export default async function (context, req) {
  context.log("FaceBook User Data deletion function processed a request.");

  if (!req.body || !req.body.signed_request) {
    console.log("Bad request"); // Ends up here whenever Facebook calls this route
    return (context.res = {
      status: 400,
    });
  }

  const secret = process.env.PROVIDER_FB_SECRET;
  const url = process.env.CONFIG_HOSTNAME + process.env.PROVIDER_FB_CALLBACK;

  try {
    const signed_request = req.body.signed_request;
    const encoded_data = signed_request.split(".", 2);
    const sig = encoded_data[0];
    const data_string = base64decode(encoded_data[1]);
    const data = JSON.parse(data_string);
    const userId = data["user_id"];
    // user data deleting
    if (!data.algorithm || data.algorithm.toUpperCase() != "HMAC-SHA256") {
      return (context.res = {
        status: 500,
        body: "Unknown algorithm: " + data.algorithm + ". Expected HMAC-SHA256",
      });
    }

    const expected_sig = crypto
      .createHmac("sha256", secret)
      .update(encoded_data[1])
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace("=", "");
    if (sig !== expected_sig) {
      return (context.res = {
        status: 500,
        body: "Invalid signature: " + sig + ". Expected " + expected_sig,
      });
    }

    return (context.res = {
      status: 200,
      body: {
        url: url,
        confirmation_code: getConfirmationCode() + `_${userId}`,
      },
    });
  } catch (error) {
    context.log.error(error);
    return (context.res = {
      status: 500,
      body: {
        message: "Unknown error",
      },
    });
  }
}

function getConfirmationCode() {
  return crypto.randomBytes(10).toString("hex");
}

function base64decode(data) {
  while (data.length % 4 !== 0) {
    data += "=";
  }
  data = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(data, "base64").toString();
}
