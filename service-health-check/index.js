export default async function (context, req) {
  context.log("Health Check function processed a request.");
  const triggerTime = new Date();
  let responseMessage = { triggerTime: triggerTime.toISOString() };

  const echo = req.query.echo || (req.body && req.body.echo);
  if (echo) {
    responseMessage.echo = echo;
  }

  context.res = {
    status: 200 /* Defaults to 200 */,
    body: responseMessage,
  };
}
