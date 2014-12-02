(function() {
  if (!mono.isGM) return;

  var storage = {
    /**
     * @namespace GM_listValues
     * @namespace GM_getValue
     * @namespace GM_setValue
     * @namespace GM_deleteValue
     */
    get: function (src, cb) {
      var key, obj = {};
      if (src === undefined || src === null) {
        var nameList = GM_listValues();
        for (key in nameList) {
          obj[key] = GM_getValue(key);
        }
        return cb(obj);
      }
      if (typeof src === 'string') {
        src = [src];
      }
      if (Array.isArray(src) === true) {
        for (var i = 0, len = src.length; i < len; i++) {
          key = src[i];
          obj[key] = GM_getValue(key);
        }
      } else {
        for (key in src) {
          obj[key] = GM_getValue(key);
        }
      }
      cb(obj);
    },
    set: function (obj, cb) {
      for (var key in obj) {
        GM_setValue(key, obj[key]);
      }
      cb && cb();
    },
    remove: function (obj, cb) {
      if (Array.isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; i++) {
          var key = obj[i];
          GM_deleteValue(key);
        }
      } else {
        GM_deleteValue(obj);
      }
      cb && cb();
    },
    clear: function (cb) {
      var nameList = GM_listValues();
      for (var key in nameList) {
        GM_deleteValue(key);
      }
      cb && cb();
    }
  };

  mono.storage = storage;
  mono.storage.local = mono.storage.sync = mono.storage;
})();