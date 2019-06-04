const http = require('http');
const fs = require('fs');
const { IncomingForm } = require('formidable');
const Busboy = require('busboy')
const qs = require('qs');

const React = fs.readFileSync('node_modules/react/umd/react.development.js');
const ReactDOM = fs.readFileSync('node_modules/react-dom/umd/react-dom.development.js');
const htm = fs.readFileSync('node_modules/htm/dist/htm.umd.js');
const uninformed = fs.readFileSync('dist/uninformed.umd.js')
const client = fs.readFileSync('example/client.js')

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Cache-control': 'private, max-age=0, no-cache',
  });
  if (req.method === 'POST') return processForm(req, res);
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Uninformed</title>
        <script>
        ${React}
        ${ReactDOM}
        ${htm}
        ${uninformed}
        </script>
      </head>
      <body>
        <div id="app">
        </div>
        <script>${client}</script>
      </body>
    </html>
  `)
});

function processForm(req, res) {
  const form = new Busboy(req);
  res.writeHead(200, { 'Content-Type': 'application/json' })
  let fields = [];
  form.on('field', (key, val) => {
    if (val) fields.push([key, val])
  })
  form.on('finish', () => {
    const body = qs.parse(fields.map(([k,v]) => `${k}=${v}`).join('&'))
    res.end(JSON.stringify(body))
  })
  req.pipe(form)
}

server.listen(3000);
