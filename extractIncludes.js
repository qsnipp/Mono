var fs = require('fs');
var extractIncludes = function (content, path) {
    content = content.replace(/\/\/@include\s+([\w\/\.]+)/g, function (text, file) {
        var subPath = path + file;
        var pos = subPath.lastIndexOf('/');
        if (pos === -1) {
            subPath += '/';
        } else {
            subPath = subPath.substr(0, pos + 1);
        }
        return extractIncludes(String(fs.readFileSync(path + file)), subPath);
    });
    return content;
};
exports.extractIncludes = extractIncludes;