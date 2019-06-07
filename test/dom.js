// loading this file will monkeypatch Node with a fake DOM and XMLHttpRequest
import { JSDOM } from 'jsdom';
import xhr from 'xhr-mock';
import qs from 'qs';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;
global.window = window;
global.FormData = window.FormData;
global.document = window.document;
xhr.setup();
xhr.post('/api', (req, res) => {
  var body;
  if (req._body instanceof FormData) {
    body = Array.from(req._body.entries()).reduce((memo, [key, val]) => {
      memo[key] = val;
      return memo;
    }, {})
  } else {
    body = qs.parse(body);
  }
  const payload = Object.assign( {}, req._headers, body)
  return res.status(200).body(JSON.stringify(payload))
})

xhr.post('/error', {
  status: 500,
  headers: {},
  body: 'Server Error',
});
