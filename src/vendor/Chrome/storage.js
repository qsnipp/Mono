(function() {
  if (!mono.isChrome || !chrome.storage) return;

  /**
   * Chrome storage mode
   * @param {string} mode - Local/Sync
   * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
   */
  var chStorage = function(mode) {
    return chrome.storage[mode];
  };

  /**
   * Chrome storage
   * @type {{get: Function, set: Function, remove: Function, clear: Function}}
   */
  mono.storage = chStorage('local');
  /**
   * Chrome local
   * @type {{get: Function, set: Function, remove: Function, clear: Function}|mono.storage|*}
   */
  mono.storage.local = mono.storage;
  /**
   * Chrome sync storage
   * @type {{get: Function, set: Function, remove: Function, clear: Function}}
   */
  mono.storage.sync = chStorage('sync');
})();