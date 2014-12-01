(function() {
  if (!mono.isChrome || !chrome.storage) return;

  var chStorage = function(mode) {
    return chrome.storage[mode];
  };

  mono.storage = chStorage('local');
  mono.storage.local = mono.storage;
  mono.storage.sync = chStorage('sync');
})();