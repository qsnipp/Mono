var ffSimpleStorage = (function() {
  var ss = require('sdk/simple-storage');
  return {
    get: function (src, cb) {
      var key, obj = {};
      if (src === undefined || src === null) {
        for (key in ss.storage) {
          if (!ss.storage.hasOwnProperty(key)) {
            continue;
          }
          obj[key] = ss.storage[key];
        }
        return cb(obj);
      }
      if (typeof src === 'string') {
        src = [src];
      }
      if (Array.isArray(src) === true) {
        for (var i = 0, len = src.length; i < len; i++) {
          key = src[i];
          if (!ss.storage.hasOwnProperty(key)) {
            continue;
          }
          obj[key] = ss.storage[key];
        }
      } else {
        for (key in src) {
          if (!ss.storage.hasOwnProperty(key)) {
            continue;
          }
          obj[key] = ss.storage[key];
        }
      }
      cb(obj);
    },
    set: function (obj, cb) {
      for (var key in obj) {
        ss.storage[key] = obj[key];
      }
      cb && cb();
    },
    remove: function (obj, cb) {
      if (Array.isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; i++) {
          var key = obj[i];
          delete ss.storage[key];
        }
      } else {
        delete ss.storage[obj];
      }
      cb && cb();
    },
    clear: function (cb) {
      for (var key in ss.storage) {
        delete ss.storage[key];
      }
      cb && cb();
    }
  }
})();
exports.storage = ffSimpleStorage;

sendHook.monoStorage = function(message) {
  var msg = message.data || {};
  var response = function(responseMessage) {
    if (message.callbackId === undefined) return;

    responseMessage = {
      data: responseMessage,
      to: message.from,
      responseId: message.callbackId
    };
    monoOnMessage(responseMessage);
  };
  var func = ffSimpleStorage[msg.action];
  if (func === undefined) return;
  if (msg.action === 'clear') {
    func(response);
  } else {
    func(msg.data, response);
  }
};