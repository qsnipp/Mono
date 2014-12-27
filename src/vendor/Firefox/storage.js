(function() {
  if (!mono.isFF || !mono.isModule) return;

  /**
   * Firefox simple storage
   * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
   */
  var ffSimpleStorage = function() {
    var ss = require('sdk/simple-storage');
    return {
      /**
       * Get item from storage
       * @param {string|null|undefined|Array|Object} src - Item's, null/undefined - all items
       * @param {function} cb - Callback function
       */
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
            obj[key] = ss.storage[key];
          }
        } else {
          for (key in src) {
            obj[key] = ss.storage[key];
          }
        }
        cb(obj);
      },
      /**
       * Set item in storage
       * @param {Object} obj
       * @param {function} [cb]
       */
      set: function (obj, cb) {
        for (var key in obj) {
          ss.storage[key] = obj[key];
        }
        cb && cb();
      },
      /**
       * Remove item from storage
       * @param {Array|string} obj
       * @param {function} [cb]
       */
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
      /**
       * Clear storage
       * @param {function} [cb]
       */
      clear: function (cb) {
        for (var key in ss.storage) {
          delete ss.storage[key];
        }
        cb && cb();
      }
    }
  };

  /**
   * FF Storage
   * @type {{get: Function, set: Function, remove: Function, clear: Function}}
   */
  mono.storage = ffSimpleStorage();
  mono.storage.local = mono.storage.sync = mono.storage;
})();