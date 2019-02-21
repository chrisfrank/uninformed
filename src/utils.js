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

function noop(wtf) {
  return wtf;
}

export var defaultProps = {
  headers: {},
  method: 'POST',
  onResponse: noop,
  responseType: 'json',
  transform: noop,
}

var privateProps = [
  "headers",
  "onError",
  "onSuccess",
  "responseType",
  "transform",
];

export function filter(props) {
  return Object.keys(props).reduce(function(memo, key) {
    var ok = privateProps.indexOf(key) === -1;
    if (ok) memo[key] = props[key];
    return memo;
  }, {})
}
