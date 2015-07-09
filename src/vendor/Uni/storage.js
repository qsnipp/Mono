mono.storageList.localStorage = mono.storageList.operaPreferences = function () {
    /**
     * localStorage mode
     * @param {object} localStorage - Storage type
     * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    var getLocalStorage = function (localStorage) {
        /**
         * localStorage mode
         * @type {{getObj: Function, setObj: Function, rmObj: Function, readValue: Function
         * get: Function, set: Function, remove: Function, clear: Function}}
         */
        var localStorageMode = {
            /**
             * Get object from localStorage
             * @param {string} key
             * @returns {*}
             */
            getObj: function (key) {
                var index = 0;
                var keyPrefix = localStorageMode.chunkPrefix + key;
                var chunk = localStorage[keyPrefix + index];
                var data = '';
                while (chunk !== undefined) {
                    data += chunk;
                    index++;
                    chunk = localStorage[keyPrefix + index];
                }
                var value = undefined;
                try {
                    value = JSON.parse(data);
                } catch (e) {
                }
                return value;
            },
            /**
             * Set object in localStorage
             * @param {string} key
             * @param {*} value
             */
            setObj: function (key, value) {
                value = JSON.stringify(value);
                var keyPrefix = localStorageMode.chunkPrefix + key;
                var chunkLen = 1024 - keyPrefix.length - 3;
                if (localStorageMode.regexp === undefined) {
                    localStorageMode.regexp = new RegExp('.{1,' + chunkLen + '}', 'g');
                }
                var valueLen = value.length;
                var number_of_part = Math.floor(valueLen / chunkLen);
                if (number_of_part >= 512) {
                    console.log('monoLog:', 'localStorage', 'Can\'t save item', key, ', very big!');
                    return;
                }
                var dataList = value.match(localStorageMode.regexp);
                var dataListLen = dataList.length;
                for (var i = 0, item; i < dataListLen; i++) {
                    item = dataList[i];
                    localStorage[keyPrefix + i] = item;
                }
                localStorage[key] = localStorageMode.chunkItem;

                localStorageMode.rmObj(key, dataListLen);
            },
            /**
             * Remove object from localStorage
             * @param {string} key
             * @param {number} index - Chunk index
             */
            rmObj: function (key, index) {
                var keyPrefix = localStorageMode.chunkPrefix + key;
                if (index === undefined) {
                    index = 0;
                }
                var data = localStorage[keyPrefix + index];
                while (data !== undefined) {
                    delete localStorage[keyPrefix + index];
                    index++;
                    data = localStorage[keyPrefix + index];
                }
            },
            /**
             * Read value from localStorage
             * @param key
             * @param value
             * @returns {*}
             */
            readValue: function (key, value) {
                if (value === localStorageMode.chunkItem) {
                    value = localStorageMode.getObj(key)
                } else
                if (value !== undefined) {
                    var data = value.substr(1);
                    var type = value[0];
                    if (type === 'i') {
                        value = parseFloat(data);
                    } else
                    if (type === 'b') {
                        value = data === 'true';
                    } else {
                        value = data;
                    }
                }
                return value;
            },
            /**
             * Get item from storage
             * @param {string|null|undefined|Array|Object} src - Item's, null/undefined - all items
             * @param {function} cb - Callback function
             */
            get: function (src, cb) {
                var key, obj = {};
                if (src === undefined || src === null) {
                    for (key in localStorage) {
                        if (!localStorage.hasOwnProperty(key) || key === 'length') {
                            continue;
                        }
                        if (key.substr(0, localStorageMode.chunkLen) === localStorageMode.chunkPrefix) {
                            continue;
                        }
                        obj[key] = localStorageMode.readValue(key, localStorage[key]);
                    }
                    return cb(obj);
                }
                if (typeof src === 'string') {
                    src = [src];
                }
                if (Array.isArray(src) === true) {
                    for (var i = 0, len = src.length; i < len; i++) {
                        key = src[i];
                        if (!localStorage.hasOwnProperty(key)) {
                            continue;
                        }
                        obj[key] = localStorageMode.readValue(key, localStorage[key]);
                    }
                } else {
                    for (key in src) {
                        if (!localStorage.hasOwnProperty(key)) {
                            continue;
                        }
                        obj[key] = localStorageMode.readValue(key, localStorage[key]);
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
                var key;
                for (key in obj) {
                    var value = obj[key];
                    if (value === undefined) {
                        localStorageMode.remove(key);
                    } else
                    if (typeof value === 'object') {
                        localStorageMode.setObj(key, value);
                    } else {
                        var type = typeof value;
                        if (type === 'boolean') {
                            value = 'b' + value;
                        } else
                        if (type === 'number') {
                            value = 'i' + value;
                        } else {
                            value = 's' + value;
                        }
                        localStorage[key] = value;
                    }
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
                        if (localStorage[key] === localStorageMode.chunkItem) {
                            localStorageMode.rmObj(key);
                        }
                        delete localStorage[key];
                    }
                } else {
                    if (localStorage[obj] === localStorageMode.chunkItem) {
                        localStorageMode.rmObj(obj);
                    }
                    delete localStorage[obj];
                }
                cb && cb();
            },
            /**
             * Clear storage
             * @param {function} [cb]
             */
            clear: function (cb) {
                localStorage.clear();
                cb && cb();
            }
        };
        localStorageMode.chunkPrefix = 'mCh_';
        localStorageMode.chunkLen = localStorageMode.chunkPrefix.length;
        localStorageMode.chunkItem = 'monoChunk';
        return localStorageMode;
    };

    /**
     * External storage mode
     * @type {{get: Function, set: Function, remove: Function, clear: Function}}
     */
    var externalStorage = {
        /**
         * Get item from storage
         * @param {string|null|undefined|Array|Object} obj - Item's, null/undefined - all items
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
     *
     * @param {object} message
     * @param {function} [response]
     */
    var externalStorageHook = function (message, response) {
        if (message.action === 'get') {
            return mono.storage.get(message.data, response);
        } else
        if (message.action === 'set') {
            return mono.storage.set(message.data, response);
        } else
        if (message.action === 'remove') {
            return mono.storage.remove(message.data, response);
        } else
        if (message.action === 'clear') {
            return mono.storage.clear(response);
        }
    };

    if (mono.storageType === 'operaPreferences') {
        mono.storage = getLocalStorage(widget.preferences);
        mono.storage.local = mono.storage.sync = mono.storage;
        return;
    }

    if (mono.isChromeInject || mono.isOperaInject || mono.isSafariInject) {
        mono.storage = externalStorage;
        mono.storage.local = mono.storage.sync = mono.storage;
        return;
    }

    var _localStorage;
    try {
        if (typeof localStorage !== 'undefined') {
            _localStorage = localStorage;
        } else
        if (window.localStorage) {
            _localStorage = window.localStorage;
        }
    } catch(e) {}

    if (_localStorage) {
        /**
         * LocalStorage
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        mono.storage = getLocalStorage(_localStorage);
        mono.storage.local = mono.storage.sync = mono.storage;
        if (mono.isChrome || mono.isSafari || mono.isOpera) {
            mono.sendHook.monoStorage = externalStorageHook;
        }
        return;
    }

    console.error('Can\'t detect localStorage!');
};