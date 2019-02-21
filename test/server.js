const express = require('express');
const path = require('path');

const app = express();
const root = path.resolve(__dirname, '..');

app.post('/input', (req, res) => {
  console.log(req.params)
  console.log(req.body.read())
  setTimeout(() => {
    res.json({ hello: 'world' });
  }, 1000);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(root));

app.listen(3000);
