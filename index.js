var fs = require('fs');

var depList = {
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
      var item =  depList[type];
      for (var key in item) {
        info[key] = item[key];
      }
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

    var str = '';
    for (i = 0, item; item = info.define[i]; i++) {
      if (!str) {
        str = item + '.js';
      } else {
        str += '\n' + '//@include components/define/' + item + '.js';
      }
    }

    content = content.replace('components/browserDefine.js', 'components/define/'+str);

    content = content.replace(/.*\/\/@include vendor\/.*\r?\n/g, '');

    content = extractIncludes(content, path);

    var insertPos = content.indexOf('//@insert');
    var partList = [content.substr(0, insertPos), content.substr(insertPos)];

    path = rootUrl + './src/vendor/';
    for (i = 0, item; item = info.messages[i]; i++) {
      var data = extractIncludes(String(fs.readFileSync(path + item)), path);
      partList.splice(partList.length - 1, 0, data);
    }

    for (i = 0, item; item = info.storage[i]; i++) {
      var data = extractIncludes(String(fs.readFileSync(path + item)), path);
      partList.splice(partList.length - 1, 0, data);
    }

    return partList.join('\n');
  },
  monoLib: function() {
    return String(fs.readFileSync('monoLib.js'));
  }
};