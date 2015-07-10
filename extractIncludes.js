var fs = require('fs');
var setIfId = require('./ifStrip').setIfId;
var extractIncludes = function (content, path) {
    "use strict";
    content = setIfId(content);
    content = content.replace(/\/\/@include\s+([\w\/\.]+)/g, function (text, file) {
        var subPath = path + file;
        var pos = subPath.lastIndexOf('/');
        if (pos === -1) {
            subPath += '/';
        } else {
            subPath = subPath.substr(0, pos + 1);
        }
        var content = String(fs.readFileSync(path + file));
        return extractIncludes(content, subPath);
    });
    return content;
};
exports.extractIncludes = extractIncludes;