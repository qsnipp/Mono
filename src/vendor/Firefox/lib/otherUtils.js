var sanitizerHTML = function (html) {
    var chrome = require('chrome');
    var Cc = chrome.Cc;
    var Ci = chrome.Ci;

    var flags = 2;

    if (sanitizerHTML.regexpList === undefined) {
        var self = require("sdk/self");
        var id = self.id.replace(/[^\w\d]/g, '_');
        sanitizerHTML.regexpList = [];
        sanitizerHTML.regexpList[1] = new RegExp('http:\\/\\/' + id + '#', 'gm');
        sanitizerHTML.regexpList[0] = /href=(['"]{1})([^'"]*)(?:['"]{1})/img;
        sanitizerHTML.regexpList[2] = /javascript/i;
        sanitizerHTML.regexpList[3] = id;
    }

    var sanitizeRegExp = sanitizerHTML.regexpList;

    html = html.replace(sanitizeRegExp[0], function (str, arg1, arg2) {
        "use strict";
        var data = arg2;
        if (arg2.search(sanitizeRegExp[2]) === 0) {
            data = '';
        } else
        if (arg2[0] === '/' || arg2.substr(0, 4) !== 'http') {
            data = 'http://' + sanitizeRegExp[3] + '#' + arg2
        }
        return 'href=' + arg1 + data + arg1;
    });

    var parser = Cc["@mozilla.org/parserutils;1"].getService(Ci.nsIParserUtils);
    var sanitizedHTML = parser.sanitize(html, flags);

    sanitizedHTML = sanitizedHTML.replace(sanitizeRegExp[1], '');

    return sanitizedHTML;
};

serviceList.xhr = function (message, response) {
    var msg = message.data || {};
    if (!serviceList.xhr.xhrList) {
        serviceList.xhr.xhrList = {};
    }
    var xhrList = serviceList.xhr.xhrList;

    var XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;
    var obj = msg.data;
    var xhr = new XMLHttpRequest();
    xhr.open(obj.open[0], obj.open[1], obj.open[2], obj.open[3], obj.open[4]);
    xhr.responseType = obj.responseType;
    if (obj.mimeType) {
        xhr.overrideMimeType(obj.mimeType);
    }
    if (obj.headers) {
        for (var key in obj.headers) {
            xhr.setRequestHeader(key, obj.headers[key]);
        }
    }
    if (obj.responseType) {
        xhr.responseType = obj.responseType;
    }
    xhr.onload = xhr.onerror = function () {
        delete xhrList[obj.id];
        return response({
            status: xhr.status,
            statusText: xhr.statusText,
            response: (obj.responseType) ? xhr.response : (obj.safe) ? sanitizerHTML(xhr.responseText) : xhr.responseText
        });
    };
    xhr.send(obj.data);
    if (obj.id) {
        xhrList[obj.id] = xhr;
    }
};
serviceList.xhrAbort = function (message) {
    var msg = message.data || {};
    var xhrList = serviceList.xhr.xhrList || {};

    var xhr = xhrList[msg.data];
    if (xhr) {
        xhr.abort();
        delete xhrList[msg.data];
    }
};