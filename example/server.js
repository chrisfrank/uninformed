const express = require('express');
const fs = require('fs');

const React = fs.readFileSync('node_modules/react/umd/react.development.js');
const ReactDOM = fs.readFileSync('node_modules/react-dom/umd/react-dom.development.js');
const htm = fs.readFileSync('node_modules/htm/dist/htm.umd.js');
const uninformed = fs.readFileSync('dist/uninformed.umd.js')
const client = fs.readFileSync('example/client.js')

const app = express();
app.use(express.urlencoded({ extended: true }))
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Uninformed</title>
        <style>
          html {
            font-size: 11px;
            font-family: verdana;
          }
          input, label {
            display: block;
          }
          form[disabled] {
            opacity: 0.1;
          }
        </style>
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

app.post('*', (req, res) => {
  res.send(JSON.stringify(req.body))
})

app.listen(3000);
