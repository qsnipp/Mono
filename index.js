var fs = require('fs');

var distList = {
    chrome: {
        define: 'chrome',
        storage: 'chromeStorage',
        useChrome: 1,
        useLocalStorage: 0
    },
    chromeForceDefineBgPage: {
        chromeForceDefineBgPage: 1
    },
    chromeUseDirectMsg: {
        chromeUseDirectMsg: 1
    },
    oldChrome: {
        define: 'chrome',
        storage: 'chromeStorage',
        useChrome: 1,
        oldChromeSupport: 1,
        useLocalStorage: 0
    },
    firefox: {
        define: 'firefox',
        storage: 'firefox',
        useFf: 1
    },
    gm: {
        define: 'gm',
        storage: 'gm',
        useGm: 1
    },
    opera: {
        define: 'opera',
        storage: 'operaPreferences',
        useOpera: 1,
        userScript: 1
    },
    safari: {
        define: 'safari',
        storage: 'localStorage',
        useSafari: 1,
        useLocalStorage: 1
    },
    localStorage: {
        storage: 'localStorage',
        useLocalStorage: 1
    },
    chromeApp: {
        define: ['chrome', 'chromeApp'],
        useChromeApp: 1
    },
    chromeWebApp: {
        define: ['chrome', 'chromeWebApp'],
        useChromeWebApp: 1
    }
};

var rootUrl = __dirname.replace(/\\/g, '/') + '/';

exports.get = {
    mono: function (typeList) {
        if (typeof typeList !== 'object') {
            typeList = [typeList];
        }

        var info = {};
        for (var i = 0, type; type = typeList[i]; i++) {
            var item = distList[type];
            if (!item) {
                console.error('Error: Item is not found in distList:', type);
                return;
            }
            for (var key in item) {
                info[key] = item[key];
            }
        }

        if (!info.storage || !info.define) {
            console.error('Error: --target is', '"' + typeList.join(',') + '"');
            return;
        }

        if (typeof info.define !== 'object') {
            info.define = [info.define];
        }

        if (typeof info.storage !== 'object') {
            info.storage = [info.storage];
        }

        var path = rootUrl + './src/';
        var content = String(fs.readFileSync(path + 'mono.js'));

        if (info.userScript) {
            content = '//@include vendor/Opera/userScript.js\n' + content;
        }

        content = content.replace(/(\/\/@include\s+components\/)browserDefine.js/, function (text, include) {
            var includeList = info.define.map(function (item) {
                return include + 'browserDefine/' + item + '.js';
            });
            return includeList.join('\n');
        });

        content = content.replace(/(\/\/@include\s+components\/)storageDefine.js/, function (text, include) {
            var includeList = info.storage.map(function (item) {
                return include + 'storageDefine/' + item + '.js';
            });
            return includeList.join('\n');
        });

        var ifStrip = require('./ifStrip.js').ifStrip;

        var extractIncludes = require('./extractIncludes.js').extractIncludes;

        content = extractIncludes(content, path);

        content = ifStrip(content, info);

        content = content.replace(/\n[\t\s]*\n/g, '\n\n');

        return content;
    },
    monoLib: function () {
        return String(fs.readFileSync(rootUrl + '/dist/monoLib.js'));
    }
};