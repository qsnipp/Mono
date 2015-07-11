mono.storageList.chrome = function () {
    /**
     * Chrome storage
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    mono.storage = chrome.storage.local;
    /**
     * Chrome local
     * @type {{get: Function, set: Function, remove: Function, clear: Function}|mono.storage|*}
     */
    mono.storage.local = mono.storage;
    /**
     * Chrome sync storage
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    mono.storage.sync = chrome.storage.sync;
};