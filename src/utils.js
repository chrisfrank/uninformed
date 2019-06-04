export function noop() {}

export function serializeWithFormData(form) {
  return new FormData(form);
}

export function sendWithXHR({ data, method, url, prepare = noop }) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open(method, url, true);
    prepare(req);
    req.onreadystatechange = function() {
      if (req.readyState !== 4) return;

      req.status >= 200 && req.status <= 300 ? resolve(req) : reject(req);
    };
    req.send(data);
  });
}

export function validateWithFaith() { return true; }
