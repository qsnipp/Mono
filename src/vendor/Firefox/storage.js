mono.storageList.simpleStorage = function() {
    /**
     * Firefox simple storage
     * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    var ffSimpleStorage = function () {
        var ss = require('sdk/simple-storage');
        return {
            /**
             * Get item from storage
             * @param {string|number|null|undefined|Array} src - Item's, null/undefined - all items
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
                if (Array.isArray(src) === false) {
                    src = [src];
                }
                for (var i = 0, len = src.length; i < len; i++) {
                    key = src[i];
                    if (!ss.storage.hasOwnProperty(key)) {
                        continue;
                    }
                    obj[key] = ss.storage[key];
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
             * @param {Array|string} arr
             * @param {function} [cb]
             */
            remove: function (arr, cb) {
                if (Array.isArray(arr) === false) {
                    arr = [arr];
                }
                for (var i = 0, len = arr.length; i < len; i++) {
                    var key = arr[i];
                    delete ss.storage[key];
                }
                cb && cb();
            },
            /**
             * Clear storage
             * @param {function} [cb]
             */
            clear: function (cb) {
                for (var key in ss.storage) {
                    if (!ss.storage.hasOwnProperty(key)) {
                        continue;
                    }
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
};

mono.storageList.externalStorage = function() {
    /**
     * External storage mode
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    var externalStorage = {
        /**
         * Get item from storage
         * @param {string|number|null|undefined|Array} obj - Item's, null/undefined - all items
         * @param {function} cb - Callback function
         */
        get: function (obj, cb) {
            mono.sendMessage({action: 'get', data: obj}, cb, 'monoStorage');
        },
        /**
         * Set item in storage
         * @param {Object} obj
         * @param {function} [cb]
         */
        set: function (obj, cb) {
            mono.sendMessage({action: 'set', data: obj}, cb, 'monoStorage');
        },
        /**
         * Remove item from storage
         * @param {Array|string} obj
         * @param {function} [cb]
         */
        remove: function (obj, cb) {
            mono.sendMessage({action: 'remove', data: obj}, cb, 'monoStorage');
        },
        /**
         * Clear storage
         * @param {function} [cb]
         */
        clear: function (cb) {
            mono.sendMessage({action: 'clear'}, cb, 'monoStorage');
        }
    };

    /**
     * FF Storage
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    mono.storage = externalStorage;
    mono.storage.local = mono.storage.sync = mono.storage;
};