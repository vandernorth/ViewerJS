"use strict";

const express = require('express'),
      app     = express();

app.use('/', express.static('./release'));
app.use('/files', express.static('./test/files'));
app.listen(81);

console.log('Listening on port 81. Go to http://localhost/index.html#/files/pdf-test.pdf');
