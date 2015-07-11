var ffSimpleStorage = (function () {
    var ss = require('sdk/simple-storage');
    return {
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
        set: function (obj, cb) {
            for (var key in obj) {
                if (obj[key] === undefined) {
                    delete ss.storage[key];
                } else {
                    ss.storage[key] = obj[key];
                }
            }
            cb && cb();
        },
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
})();
exports.storage = ffSimpleStorage;

sendHook.monoStorage = function (message) {
    var msg = message.data || {};
    var response = function (responseMessage) {
        if (message.callbackId === undefined) return;

        responseMessage = {
            data: responseMessage,
            to: message.from,
            responseId: message.callbackId
        };
        monoOnMessage(responseMessage);
    };
    var func = ffSimpleStorage[msg.action];
    if (func === undefined) return;
    if (msg.action === 'set') {
        for (var i = 0, len = msg.keys.length; i < len; i++) {
            var key = msg.keys[i];
            if (!msg.data.hasOwnProperty(key)) {
                msg.data[key] = undefined;
            }
        }
    }
    if (msg.action === 'clear') {
        func(response);
    } else {
        func(msg.data, response);
    }
};