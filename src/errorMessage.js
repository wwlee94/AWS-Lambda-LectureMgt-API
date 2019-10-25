module.exports = function(resource, httpMethod, message) {
  const msg = {};
  msg["resource"] = resource;
  msg["httpMethod"] = httpMethod;
  msg["message"] = message;
  return JSON.stringify(msg);
}
