export function buildRequest({
  data,
  headers,
  method,
  onLoad,
  responseType,
  url,
}) {
  let req = new XMLHttpRequest();
  req.responseType = responseType;
  req.open(method, url, true);
  Object.keys(headers).forEach(key => {
    req.setRequestHeader(key, headers[key]);
  });
  req.onload = onLoad;
  return req;
}

export function buildResponse(request) {
  return {
    body: request.response,
    headers: request.getAllResponseHeaders(),
    ok: request.status < 300,
    status: request.status,
  };
}

export function noop(wtf) {
  return wtf;
}

export function filter(props, blocklist) {
  return Object.keys(props).reduce(function(memo, key) {
    var ok = blocklist.indexOf(key) === -1;
    if (ok) memo[key] = props[key];
    return memo;
  }, {})
}
