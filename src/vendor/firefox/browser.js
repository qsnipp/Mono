var browserApi = function (_addon) {
    "use strict";
    var browserAddon = null;
    if (_addon) {
        browserAddon = _addon;
    } else 
    if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
        browserAddon = addon;
    } else 
    if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
        browserAddon = self;
    }

    if (!browserAddon) {
        browserAddon = {
            port: {
                listenerList: [],
                listener: function (event) {
                    var _this = browserAddon.port;
                    if (event.detail[0] !== '<') {
                        return;
                    }
                    var data = event.detail.substr(1);
                    for (var i = 0, cb; cb = _this.listenerList[i]; i++) {
                        cb(JSON.parse(data));
                    }
                },
                emit: function (pageId, message) {
                    var msg = '>' + JSON.stringify(message);
                    window.postMessage(msg, "*");
                },
                on: function (pageId, callback) {
                    if (this.listenerList.indexOf(callback) === -1) {
                        this.listenerList.push(callback);
                    }

                    window.addEventListener('monoMessage', this.listener);
                },
                removeListener: function (pageId, callback) {
                    var pos = this.listenerList.indexOf(callback);
                    if (pos !== -1) {
                        this.listenerList.splice(pos, 1);
                    }

                    if (!this.listenerList.length) {
                        window.removeEventListener('monoMessage', this.listener);
                    }
                }
            }
        }
    }

    var emptyFn = function () {};

    /**
     * @param {Function} fn
     * @returns {Function}
     */
    var onceFn = function (fn) {
        return function (msg) {
            if (fn) {
                fn(msg);
                fn = null;
            }
        };
    };

    /**
     * @returns {Number}
     */
    var getTime = function () {
        return parseInt(Date.now() / 1000);
    };

    var msgTools = {
        id: 0,
        idPrefix: Math.floor(Math.random() * 1000),
        /**
         * @returns {String}
         */
        getId: function () {
            return this.idPrefix + '_' + (++this.id);
        },
        /**
         * @typedef {Object} Source
         * @property {Function} postMessage
         */
        /**
         * @param {string} id
         * @param {string} pageId
         * @returns {Function}
         */
        asyncSendResponse: function (id, pageId) {
            return function (message) {
                message.responseId = id;
                message.to = pageId;

                browserAddon.port.emit('mono', message);
            };
        },
        listenerList: [],
        /**
         * @typedef {Object} MonoMsg
         * @property {boolean} mono
         * @property {string} [hook]
         * @property {string} idPrefix
         * @property {string} [callbackId]
         * @property {string} [responseId]
         * @property {string} from
         * @property {string} to
         * @property {boolean} hasCallback
         * @property {*} data
         */
        /**
         * @param {MonoMsg} message
         */
        listener: function (message) {
            var _this = msgTools;
            var sendResponse = null;
            if (message && message.mono && !message.responseId && message.idPrefix !== _this.idPrefix) {
                if (!message.hasCallback) {
                    sendResponse = emptyFn;
                } else {
                    sendResponse = _this.asyncSendResponse(message.callbackId, message.from);
                }

                var responseFn = onceFn(function (msg) {
                    var message = _this.wrap(msg);
                    sendResponse(message);
                    sendResponse = null;
                });

                _this.listenerList.forEach(function (fn) {
                    if (message.hook === fn.hook) {
                        fn(message.data, responseFn);
                    }
                });
            }
        },
        async: {},
        /**
         * @param {MonoMsg} message
         */
        asyncListener: function (message) {
            var _this = msgTools;
            if (message && message.mono && message.responseId && message.idPrefix !== _this.idPrefix) {
                var item = _this.async[message.responseId];
                var fn = item && item.fn;
                if (fn) {
                    delete _this.async[message.responseId];
                    if (!Object.keys(_this.async).length) {
                        _this.removeMessageListener(_this.asyncListener);
                    }

                    fn(message.data);
                }
            }

            _this.gc();
        },
        /**
         * @param {*} [msg]
         * @returns {MonoMsg}
         */
        wrap: function (msg) {
            return {
                mono: true,
                data: msg,
                idPrefix: this.idPrefix
            };
        },
        /**
         * @param {string} id
         * @param {Function} responseCallback
         */
        wait: function (id, responseCallback) {
            this.async[id] = {
                fn: responseCallback,
                time: getTime()
            };

            this.addMessageListener(this.asyncListener);

            this.gc();
        },
        messageListeners: [],
        /**
         * @param {Function} callback
         */
        addMessageListener: function (callback) {
            var listeners = this.messageListeners;
            if (listeners.indexOf(callback) === -1) {
                browserAddon.port.on('mono', callback);
                listeners.push(callback);
            }
        },
        /**
         * @param {Function} callback
         */
        removeMessageListener: function (callback) {
            var listeners = this.messageListeners;
            var pos = listeners.indexOf(callback);
            if (pos !== -1) {
                browserAddon.port.removeListener('mono', callback);
                listeners.splice(pos, 1);
            }
        },
        gcTimeout: 0,
        gc: function () {
            var now = getTime();
            if (this.gcTimeout < now) {
                var expire = 180;
                var async = this.async;
                this.gcTimeout = now + expire;
                Object.keys(async).forEach(function (responseId) {
                    if (async[responseId].time + expire < now) {
                        delete async[responseId];
                    }
                });

                if (!Object.keys(async).length) {
                    this.removeMessageListener(this.asyncListener);
                }
            }
        }
    };

    var api = {
        isFF: true,
        isModule: typeof _addon !== 'undefined',
        /**
         * @param {*} msg
         * @param {Function} [responseCallback]
         */
        sendMessageToActiveTab: function (msg, responseCallback) {
            this.sendMessage({
                action: 'getActiveWindowActiveTab'
            }, function (tabs) {
                tabs.forEach(function (tab) {
                    var tabId = tab.id;
                    if (tabId >= 0) {
                        var message = msgTools.wrap(msg);
                        message.to = tabId;

                        var hasCallback = !!responseCallback;
                        message.hasCallback = hasCallback;
                        if (hasCallback) {
                            message.callbackId = msgTools.getId();
                            msgTools.wait(message.callbackId, responseCallback);
                        }

                        browserAddon.port.emit('mono', message);
                    }
                });
            }, 'service');
        },
        /**
         * @param {*} msg
         * @param {Function} [responseCallback]
         * @param {String} [hook]
         */
        sendMessage: function (msg, responseCallback, hook) {
            var message = msgTools.wrap(msg);
            hook && (message.hook = hook);

            var hasCallback = !!responseCallback;
            message.hasCallback = hasCallback;
            if (hasCallback) {
                message.callbackId = msgTools.getId();
                msgTools.wait(message.callbackId, responseCallback);
            }

            browserAddon.port.emit('mono', message);
        },
        onMessage: {
            /**
             * @param {Function} callback
             * @param {Object} [details]
             */
            addListener: function (callback, details) {
                details = details || {};
                details.hook && (callback.hook = details.hook);

                if (msgTools.listenerList.indexOf(callback) === -1) {
                    msgTools.listenerList.push(callback);
                }

                msgTools.addMessageListener(msgTools.listener);
            },
            /**
             * @param {Function} callback
             */
            removeListener: function (callback) {
                var pos = msgTools.listenerList.indexOf(callback);
                if (pos !== -1) {
                    msgTools.listenerList.splice(pos, 1);
                }

                if (!msgTools.listenerList.length) {
                    msgTools.removeMessageListener(msgTools.listener);
                }
            }
        }
    };

    var externalStorage = function () {
        return {
            /**
             * @param {String|[String]|Object|null|undefined} [keys]
             * @param {Function} callback
             */
            get: function (keys, callback) {
                if (keys === undefined) {
                    keys = null;
                }
                return api.sendMessage({
                    get: keys
                }, callback, 'storage');
            },
            /**
             * @param {Object} items
             * @param {Function} [callback]
             */
            set: function (items, callback) {
                return api.sendMessage({
                    set: items
                }, callback, 'storage');
            },
            /**
             * @param {String|[String]} [keys]
             * @param {Function} [callback]
             */
            remove: function (keys, callback) {
                return api.sendMessage({
                    remove: keys
                }, callback, 'storage');
            },
            /**
             * @param {Function} [callback]
             */
            clear: function (callback) {
                return api.sendMessage({
                    clear: true
                }, callback, 'storage');
            }
        };
    };

    api.storage = externalStorage();

    return {
        api: api
    };
};