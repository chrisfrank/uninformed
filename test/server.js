const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const root = path.resolve(__dirname, '..');

app.use(multer().single())

app.post('/input', (req, res) => {
  let { name } = req.body || { name: 'anonymous' };
  setTimeout(() => {
    res.json({ hello: name });
  }, 500);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});

app.get('/data', (req, res) => {
  res.json({ hello: 'world' });
});

app.use(express.static(root));

app.listen(3000);
