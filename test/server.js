"use strict";

const express = require('express'),
      app     = express();

app.use('/', express.static('./release'));
app.use('/files', express.static('./test/files'));
app.listen(81);

console.log(`Listening on port 81.
 Try one of the following tests:
  - http://localhost/index.html#/files/pdf-test.pdf
  - http://localhost/index.html#/files/small.mp4
  - http://localhost/index.html#/files/small.webm
  - http://localhost/index.html#/files/test.png
  - http://localhost/index.html#/files/text.txt
  
  `);
