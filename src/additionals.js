var pdfjs_version    = '1.4.265',
    ViewerJS_version = '0.6.4';

function loadPlugin( pluginName, callback ) {
    "use strict";
    var script        = document.createElement('script');
    script.async  = false;
    script.onload = callback;
    script.src    = pluginName + '.js';
    script.type   = 'text/javascript';
    document.head.appendChild(script);
}
