var fs = require('fs');

var rootUrl = __dirname.replace(/\\/g, '/') + '/';

exports.get = {
    mono: function(options) {
        "use strict";
        var path = rootUrl + './src/';

        var content = String(fs.readFileSync(path + 'mono.js'));

        var ifStrip = require('./ifStrip.js').ifStrip;

        var extractIncludes = require('./extractIncludes.js').extractIncludes;

        if (options.useOpera) {
            content = '//@include vendor/Opera/userScript.js\n' + content;
        }

        content = extractIncludes(content, path);

        content = ifStrip(content, options);

        content = content.replace(/\n[\t\s]*\n/g, '\n\n');

        return content;
    },
    monoLib: function () {
        "use strict";
        return String(fs.readFileSync(rootUrl + '/dist/monoLib.js'));
    }
};