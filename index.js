var fs = require('fs');

var dep = {
  chrome: {
    messages: ['Chrome/messages.js'],
    storage: ['Chrome/storage.js']
  },
  oldChrome: {
    messages: [
      'Chrome/messages.js',
      'OldChrome/messages.js'
    ],
    storage: ['Chrome/storage.js']
  },
  firefox: {
    messages: ['Firefox/messages.js'],
    storage: ['Firefox/storage.js']
  },
  gm: {
    messages: ['GM/messages.js'],
    storage: ['GM/storage.js']
  },
  opera: {
    messages: ['Opera/messages.js'],
    storage: ['Uni/storage.js']
  },
  safari: {
    messages: ['Safari/messages.js'],
    storage: ['Uni/storage.js']
  },
  localStorage: {
    storage: ['Uni/storage.js']
  }
};

var rootUrl = __dirname.replace(/\\/g, '/') + '/';

exports.get = {
  mono: function(depList) {
    var basePath = rootUrl + './src/';
    if (!Array.isArray(depList)) {
      depList = [depList];
    }

    var messages = [], storage = [];
    for (var i = 0, item; item = depList[i]; i++) {
      var depItem = dep[item];
      if (depItem.messages) {
        messages = depItem.messages;
      }
      if (depItem.storage) {
        storage = depItem.storage;
      }
    }

    var mono = fs.readFileSync(basePath + 'mono.js');
    mono = String(mono);
    var splitPos = mono.indexOf('//@insert');
    var partList = [mono.substr(0, splitPos), mono.substr(splitPos)];

    var moduleList = messages.concat(storage);
    for (var n = 0, fileItem; fileItem = moduleList[n]; n++) {
      var content = fs.readFileSync(basePath + 'vendor/' + fileItem);
      content = String(content);
      partList.splice(partList.length - 1, 0, content);
    }

    return partList.join('\n');
  },
  monoLib: function() {
    var basePath = rootUrl + './src/vendor/Firefox/lib/';
    var monoLib = fs.readFileSync(basePath + 'monoLib.js');
    monoLib = String(monoLib);
    var splitPos = mono.indexOf('//@');
    var partList = [mono.substr(0, splitPos), mono.substr(splitPos)];
    var dep = ['storage.js', 'utils.js'];
    for (var n = 0, fileItem; fileItem = dep[n]; n++) {
      var content = fs.readFileSync(basePath + fileItem);
      content = String(content);
      partList.splice(partList.length - 1, 0, content);
    }

    return partList.join('\n');
  }
};