var fs = require('fs');

var distList = {
  chrome: {
    define: 'chrome',
    messages: 'Chrome/messages.js',
    storage: 'Chrome/storage.js'
  },
  oldChrome: {
    define: 'chrome',
    messages: [
      'Chrome/messages.js',
      'OldChrome/messages.js'
    ],
    storage: 'Chrome/storage.js'
  },
  firefox: {
    define: 'firefox',
    messages: 'Firefox/messages.js',
    storage: 'Firefox/storage.js'
  },
  gm: {
    define: 'gm',
    messages: 'GM/messages.js',
    storage: 'GM/storage.js'
  },
  opera: {
    define: 'opera',
    messages: 'Opera/messages.js',
    storage: 'Uni/storage.js'
  },
  safari: {
    define: 'safari',
    messages: 'Safari/messages.js',
    storage: 'Uni/storage.js'
  },
  localStorage: {
    storage: 'Uni/storage.js'
  },
  chromeApp: {
    define: ['chrome', 'chromeApp']
  }
};

var rootUrl = __dirname.replace(/\\/g, '/') + '/';

var extractIncludes = function(content, path) {
  content = content.replace(/\/\/@include\s+([\w\/\.]+)/g, function(text, file) {
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

exports.get = {
  mono: function(typeList) {
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

    if (!info.messages || !info.storage || !info.define) {
      console.error('Error: --target is', '"'+typeList.join(',')+'"');
      return;
    }

    var path = rootUrl + './src/';
    var content = String(fs.readFileSync(path + 'mono.js'));
    if (typeof info.define !== 'object') {
      info.define = [info.define];
    }
    if (typeof info.messages !== 'object') {
      info.messages = [info.messages];
    }
    if (typeof info.storage !== 'object') {
      info.storage = [info.storage];
    }

    content = content.replace(/(\/\/@include\s+components\/)browserDefine.js/, function(text, include) {
      var includeList = info.define.map(function(item) {
        return include + 'define/' + item + '.js';
      });
      return includeList.join('\n');
    });

    content = content.replace(/.*\/\/@include vendor\/.*\r?\n/g, '');

    content = extractIncludes(content, path);

    path = rootUrl + './src/vendor/';
    var insertPos = content.indexOf('//@insert');

    // insert start of content
    var partList = [content.substr(0, insertPos)];

    partList = partList.concat(info.messages.map(function(item) {
      return extractIncludes(String(fs.readFileSync(path + item)), path);
    }));

    partList = partList.concat(info.storage.map(function(item) {
      return extractIncludes(String(fs.readFileSync(path + item)), path);
    }));

    // insert end of content
    partList.push(content.substr(insertPos));

    return partList.join('\n');
  },
  monoLib: function() {
    return String(fs.readFileSync(rootUrl + '/dist/monoLib.js'));
  }
};