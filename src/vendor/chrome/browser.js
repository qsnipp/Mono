var browserApi = function () {
    "use strict";
    var isInject = location.protocol !== 'chrome-extension:' || location.host !== chrome.runtime.id;
    var isBgPage = false;
    !isInject && (function () {
        isBgPage = location.pathname.indexOf('_generated_background_page.html') !== -1;
        //@if chromeForceDefineBgPage=1>
        if (!isBgPage && chrome.runtime.hasOwnProperty('getBackgroundPage')) {
            try {
                chrome.runtime.getBackgroundPage(function (bgWin) {
                    isBgPage = bgWin === window;
                });
            } catch (e) {}
        }
        //@if chromeForceDefineBgPage=1<
    })();

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
         * @typedef {Object} Sender
         * @property {Object} [tab]
         * @property {number} tab.callbackId
         * @property {number} [frameId]
         */
        /**
         * @param {string} id
         * @param {Sender} sender
         * @returns {Function}
         */
        asyncSendResponse: function (id, sender) {
            return function (message) {
                message.responseId = id;

                if (sender.tab && sender.tab.id >= 0) {
                    if (sender.frameId !== undefined) {
                        chrome.tabs.sendMessage(sender.tab.id, message, {
                            frameId: sender.frameId
                        });
                    } else {
                        chrome.tabs.sendMessage(sender.tab.id, message);
                    }
                } else {
                    chrome.runtime.sendMessage(message);
                }
            };
        },
        listenerList: [],
        /**
         * @typedef {Object} MonoMsg
         * @property {boolean} mono
         * @property {string} [hook]
         * @property {string} idPrefix
         * @property {string} [callbackId]
         * @property {boolean} [async]
         * @property {boolean} isBgPage
         * @property {string} [responseId]
         * @property {boolean} hasCallback
         * @property {*} data
         */
        /**
         * @param {MonoMsg} message
         * @param {Sender} sender
         * @param {Function} _sendResponse
         */
        listener: function (message, sender, _sendResponse) {
            var _this = msgTools;
            var sendResponse = null;
            if (message && message.mono && !message.responseId && message.idPrefix !== _this.idPrefix && message.isBgPage !== isBgPage) {
                if (!message.hasCallback) {
                    sendResponse = emptyFn;
                } else {
                    sendResponse = _this.asyncSendResponse(message.callbackId, sender);
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
         *
         * @param {MonoMsg} message
         * @param {Sender} sender
         * @param {Function} sendResponse
         */
        asyncListener: function (message, sender, sendResponse) {
            var _this = msgTools;
            if (message && message.mono && message.responseId && message.idPrefix !== _this.idPrefix && message.isBgPage !== isBgPage) {
                var item = _this.async[message.responseId];
                var fn = item && item.fn;
                if (fn) {
                    delete _this.async[message.responseId];
                    if (!Object.keys(_this.async).length) {
                        chrome.runtime.onMessage.removeListener(_this.asyncListener);
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
                idPrefix: this.idPrefix,
                isBgPage: isBgPage
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

            if (!chrome.runtime.onMessage.hasListener(this.asyncListener)) {
                chrome.runtime.onMessage.addListener(this.asyncListener);
            }

            this.gc();
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
                    chrome.runtime.onMessage.removeListener(this.asyncListener);
                }
            }
        }
    };

    var api = {
        isChrome: true,
        /**
         * @param {*} msg
         * @param {Function} [responseCallback]
         */
        sendMessageToActiveTab: function (msg, responseCallback) {
            var message = msgTools.wrap(msg);

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var tabId = tabs[0] && tabs[0].id;
                if (tabId >= 0) {
                    var hasCallback = !!responseCallback;
                    message.hasCallback = hasCallback;
                    if (hasCallback) {
                        message.callbackId = msgTools.getId();
                        msgTools.wait(message.callbackId, responseCallback);
                    }

                    chrome.tabs.sendMessage(tabId, message, emptyFn);
                }
            });
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

            chrome.runtime.sendMessage(message, emptyFn);
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

                if (!chrome.runtime.onMessage.hasListener(msgTools.listener)) {
                    chrome.runtime.onMessage.addListener(msgTools.listener);
                }
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
                    chrome.runtime.onMessage.removeListener(msgTools.listener);
                }
            }
        }
    };

    var initChromeStorage = function () {
        return {
            /**
             * @param {String|[String]|Object|null|undefined} [keys]
             * @param {Function} callback
             */
            get: function (keys, callback) {
                chrome.storage.local.get(keys, callback);
            },
            /**
             * @param {Object} items
             * @param {Function} [callback]
             */
            set: function (items, callback) {
                chrome.storage.local.set(items, callback);
            },
            /**
             * @param {String|[String]} [keys]
             * @param {Function} [callback]
             */
            remove: function (keys, callback) {
                chrome.storage.local.remove(keys, callback);
            },
            /**
             * @param {Function} [callback]
             */
            clear: function (callback) {
                chrome.storage.local.clear(callback);
            }
        };
    };
    
    //@if useLocalStorage=1>
    //@include ../../components/localStorage.js
    //@if useLocalStorage=1<

    if (chrome.storage) {
        api.storage = initChromeStorage();
    }
    //@if useLocalStorage=1>
    else {
        api.storage = initLocalStorage(isInject);
    }
    //@if useLocalStorage=1<

    return {
        api: api
    };
};