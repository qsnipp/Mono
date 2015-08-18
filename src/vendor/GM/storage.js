mono.storageList.gm = function () {
    /**
     * GM storage
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    var storage = {
        /**
         * @namespace GM_listValues
         * @namespace GM_getValue
         * @namespace GM_setValue
         * @namespace GM_deleteValue
         */

        /**
         * Get item from storage
         * @param {string|number|null|undefined|Array} src - Item's, null/undefined - all items
         * @param {function} cb - Callback function
         */
        get: function (src, cb) {
            var key, value, obj = {}, i, len;
            if (src === undefined || src === null) {
                var nameList = GM_listValues();
                for (i = 0, len = nameList.length; i < len; i++) {
                    key = nameList[i];
                    obj[key] = GM_getValue(key);
                }
                return cb(obj);
            }
            if (Array.isArray(src) === false) {
                src = [src];
            }
            for (i = 0, len = src.length; i < len; i++) {
                key = src[i];
                value = GM_getValue(key, 'isMonoEmptyValue');
                if (value !== undefined && value !== 'undefined' && value !== 'isMonoEmptyValue') {
                    if (typeof value !== 'object') {
                        obj[key] = value;
                    } else {
                        obj[key] = JSON.parse(JSON.stringify(value));
                    }
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
                if (typeof obj[key] !== 'object') {
                    GM_setValue(key, obj[key]);
                } else {
                    GM_setValue(key, JSON.parse(JSON.stringify(obj[key])));
                }
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
                GM_deleteValue(key);
            }
            cb && cb();
        },
        /**
         * Clear storage
         * @param {function} [cb]
         */
        clear: function (cb) {
            var nameList = GM_listValues();
            for (var i = 0, len = nameList.length; i < len; i++) {
                var key = nameList[i];
                GM_deleteValue(key);
            }
            cb && cb();
        }
    };

    /**
     * GM Storage
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    mono.storage = storage;
    mono.storage.local = mono.storage.sync = mono.storage;
};