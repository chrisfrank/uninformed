export function noop() {}

export function serializeToFormData(form) {
  return new FormData(form);
}

export function serializeToArray(form) {
  let fields = [];

  function parseInput(input, key) {
    const name = key || input.name;
    if (!name) return;
    if (/checkbox|radio/i.test(input.type) && !input.checked) return
    if ('selected' in input && !input.selected) return;
    return [encodeURIComponent(name), encodeURIComponent(input.value)]
  }

  function recursivelyParseInputs(elements = form.elements, key) {
    for (let i = 0; i < elements.length; i += 1) {
      const elem = elements[i];
      if (elem.options) {
        recursivelyParseInputs(elem.options, elem.name)
      } else {
        const pair = parseInput(elem, key);
        pair && fields.push(pair);
      }
    }
  }

  recursivelyParseInputs();
  return fields;
}

export const serializers = {
  "application/x-www-form-urlencoded": form => {
    const fields = serializeToArray(form);
    return fields.map(([key, val]) => `${key}=${val}`).join('&')
  },
  "application/json": form => {
    const fields = serializeToArray(form);
    const data = fields.reduce((memo, [key, val]) => {
      memo[key] = val;
      return memo;
    }, {})
    return JSON.stringify(data);
  },
  "multipart/form-data": serializeToFormData,
}


export function sendWithXHR({
  body,
  contentType,
  method,
  url,
  onError,
  onSuccess,
  beforeSend,
}) {
  let req = new XMLHttpRequest();
  req.open(method, url, true);
  contentType && req.setRequestHeader('Content-Type', contentType);
  beforeSend(req);
  req.onreadystatechange = function() {
    if (req.readyState !== 4) return;

    req.status >= 200 && req.status <= 300 ? onSuccess(req) : onError(req);
  };
  req.send(body);
  return req;
}
