/**
 * Copyright (C) 2012-2015 KO GmbH <copyright@kogmbh.com>
 *
 * @licstart
 * This file is part of ViewerJS.
 *
 * ViewerJS is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License (GNU AGPL)
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * ViewerJS is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with ViewerJS.  If not, see <http://www.gnu.org/licenses/>.
 * @licend
 *
 * @source: http://viewerjs.org/
 * @source: http://github.com/kogmbh/ViewerJS
 */

/*global document, window, Viewer, ODFViewerPlugin, PDFViewerPlugin*/

(function () {
    "use strict";

    var css,
        pluginRegistry  = [
            (function () {
                var odfMimetypes      = [
                    'application/vnd.oasis.opendocument.text',
                    'application/vnd.oasis.opendocument.text-flat-xml',
                    'application/vnd.oasis.opendocument.text-template',
                    'application/vnd.oasis.opendocument.presentation',
                    'application/vnd.oasis.opendocument.presentation-flat-xml',
                    'application/vnd.oasis.opendocument.presentation-template',
                    'application/vnd.oasis.opendocument.spreadsheet',
                    'application/vnd.oasis.opendocument.spreadsheet-flat-xml',
                    'application/vnd.oasis.opendocument.spreadsheet-template'];
                var odfFileExtensions = [
                    'odt',
                    'fodt',
                    'ott',
                    'odp',
                    'fodp',
                    'otp',
                    'ods',
                    'fods',
                    'ots'];

                return {
                    supportsMimetype:      function ( mimetype ) {
                        return (odfMimetypes.indexOf(mimetype) !== -1);
                    },
                    supportsFileExtension: function ( extension ) {
                        return (odfFileExtensions.indexOf(extension) !== -1);
                    },
                    path:                  "./ODFViewerPlugin",
                    getClass:              function () {
                        return ODFViewerPlugin;
                    }
                };
            }()),
            {
                supportsMimetype:      function ( mimetype ) {
                    return (mimetype === 'application/pdf');
                },
                supportsFileExtension: function ( extension ) {
                    return (extension === 'pdf');
                },
                path:                  "./PDFViewerPlugin",
                getClass:              function () {
                    return PDFViewerPlugin;
                }
            },
            (function () {
                var imageMimetypes      = [
                    'image/jpeg',
                    'image/pjpeg',
                    'image/gif',
                    'image/png',
                    'image/bmp'];
                var imageFileExtensions = [
                    'png',
                    'jpg',
                    'jpeg',
                    'gif',
                    'bmp'];

                return {
                    supportsMimetype:      function ( mimetype ) {
                        return (imageMimetypes.indexOf(mimetype) !== -1);
                    },
                    supportsFileExtension: function ( extension ) {
                        return (imageFileExtensions.indexOf(extension) !== -1);
                    },
                    path:                  "./ImageViewerPlugin",
                    getClass:              function () {
                        return ImageViewerPlugin;
                    }
                };
            }()),
            (function () {
                var multimediaMimetypes      = [
                    'video/mp4',
                    'video/ogg',
                    'video/webm',
                    'audio/aac',
                    'audio/mp4',
                    'audio/mpeg',
                    'audio/ogg',
                    'audio/wav',
                    'audio/webm'];
                var multimediaFileExtensions = [
                    'aac',
                    'mp4',
                    'm4a',
                    'mp3',
                    'mpg',
                    'mpeg',
                    'ogg',
                    'wav',
                    'webm',
                    'm4v',
                    'ogv',
                    'oga',
                    'mp1',
                    'mp2'];

                return {
                    supportsMimetype:      function ( mimetype ) {
                        return (multimediaMimetypes.indexOf(mimetype) !== -1);
                    },
                    supportsFileExtension: function ( extension ) {
                        return (multimediaFileExtensions.indexOf(extension) !== -1);
                    },
                    path:                  "./MultimediaViewerPlugin",
                    getClass:              function () {
                        return MultimediaViewerPlugin;
                    }
                };
            }())
        ],
        unknownFileType = {
            supportsMimetype:      function () {
                return true;
            },
            supportsFileExtension: function () {
                return true;
            },
            path:                  "./UnknownFilePlugin",
            getClass:              function () {
                return UnknownFilePlugin;
            }
        };

    function estimateTypeByHeaderContentType( documentUrl, cb ) {
        var xhr                = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            var mimetype, matchingPluginData;
            if ( xhr.readyState === 4 ) {
                if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 0 ) {
                    mimetype = xhr.getResponseHeader('content-type');

                    if ( mimetype ) {
                        pluginRegistry.some(function ( pluginData ) {
                            if ( pluginData.supportsMimetype(mimetype) ) {
                                matchingPluginData = pluginData;
                                console.log('Found plugin by mimetype and xhr head: ' + mimetype);
                                // store the mimetype globally
                                window.mimetype = mimetype;
                                return true;
                            }
                            return false;
                        });
                    }
                }
                if ( !matchingPluginData ) {
                    matchingPluginData = unknownFileType;
                }
                cb(matchingPluginData);
            }
        };
        xhr.open("HEAD", documentUrl, true);
        xhr.send();
    }

    function doEstimateTypeByFileExtension( extension ) {
        var matchingPluginData;

        pluginRegistry.some(function ( pluginData ) {
            if ( pluginData.supportsFileExtension(extension) ) {
                matchingPluginData = pluginData;
                return true;
            }
            return false;
        });

        return matchingPluginData;
    }

    function estimateTypeByFileExtension( extension ) {
        var matchingPluginData = doEstimateTypeByFileExtension(extension)

        if ( matchingPluginData ) {
            console.log('Found plugin by parameter type: ' + extension);

            // this is needed for the Multimedia Plugin
            window.mimetype = getMimeByExtension(extension);
        }

        return matchingPluginData;
    }

    function estimateTypeByFileExtensionFromPath( documentUrl ) {
        // See to get any path from the url and grep what could be a file extension
        var documentPath       = documentUrl.split('?')[0],
            extension          = documentPath.split('.').pop(),
            matchingPluginData = doEstimateTypeByFileExtension(extension)

        if ( matchingPluginData ) {
            console.log('Found plugin by file extension from path: ' + extension);
        }

        return matchingPluginData;
    }

    function parseSearchParameters( location ) {
        var parameters = {},
            search     = location.search || "?";

        search.substr(1).split('&').forEach(function ( q ) {
            // skip empty strings
            if ( !q ) {
                return;
            }
            // if there is no '=', have it handled as if given key was set to undefined
            var s                                = q.split('=', 2);
            parameters[decodeURIComponent(s[0])] = decodeURIComponent(s[1]);
        });

        return parameters;
    }

    function getMimeByExtension( ext ) {
        var extToMimes = {
            'aac':  'audio/aac',
            'mp4':  'video/mp4',
            'm4a':  'audio/mp4',
            'mp3':  'audio/mpeg',
            'mpg':  'video/mpeg',
            'mpeg': 'video/mpeg',
            'ogg':  'video/ogg',
            'wav':  'audio/wav',
            'webm': 'video/webm',
            'm4v':  'video/mp4',
            'ogv':  'video/ogg',
            'oga':  'audio/ogg',
            'mp1':  'audio/mpeg',
            'mp2':  'audio/mpeg'
        };

        if ( extToMimes.hasOwnProperty(ext) ) {
            return extToMimes[ext];
        }
        return false;
    }

    window.onload = function () {
        var viewer,
            documentUrl = document.location.hash.substring(1),
            parameters  = parseSearchParameters(document.location),
            Plugin;

        if ( documentUrl ) {
            // try to guess the title as filename from the location, if not set by parameter
            if ( !parameters.title ) {
                parameters.title = documentUrl.replace(/^.*[\\\/]/, '');
            }

            parameters.documentUrl = documentUrl;
            pluginData = estimateTypeByFileExtension("pdf");

            if ( pluginData ) {
                if ( String(typeof loadPlugin) !== "undefined" ) {
                    loadPlugin(pluginData.path, function () {
                        Plugin = pluginData.getClass();
                        viewer = new Viewer(new Plugin(), parameters);
                    });
                } else {
                    Plugin = pluginData.getClass();
                    viewer = new Viewer(new Plugin(), parameters);
                }
            } else {
                viewer = new Viewer();
            }
        } else {
            viewer = new Viewer();
        }
    };

    /*css = (document.createElementNS(document.head.namespaceURI, 'style'));
     css.setAttribute('media', 'screen');
     css.setAttribute('type', 'text/css');
     css.appendChild(document.createTextNode(viewer_css));
     document.head.appendChild(css);

     css = (document.createElementNS(document.head.namespaceURI, 'style'));
     css.setAttribute('media', 'only screen and (max-device-width: 800px) and (max-device-height: 800px)');
     css.setAttribute('type', 'text/css');
     css.setAttribute('viewerTouch', '1');
     css.appendChild(document.createTextNode(viewerTouch_css));
     document.head.appendChild(css);
     */
}());
