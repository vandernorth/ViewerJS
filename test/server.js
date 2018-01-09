"use strict";

const express = require('express'),
      app     = express();
      port = 8181
app.use('/', express.static('./release'));
app.use('/files', express.static('./test/files'));
app.listen(port);


console.log(`Listening on port ${port}.
 Try one of the following tests:
  - http://localhost:${port}/index.html#/files/pdf-test.pdf
  - http://localhost:${port}/index.html#/files/small.mp4
  - http://localhost:${port}/index.html#/files/small.webm
  - http://localhost:${port}/index.html#/files/test.png
  - http://localhost:${port}/index.html#/files/text.txt
  - http://localhost:${port}/index.html#/files/unknown.zfx
  
  `);
