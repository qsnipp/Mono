mono.msgList.firefox = function () {
    if (mono.noAddon) {
        var onCollector = [];
        var onMessage = function (e) {
            if (e.detail[0] !== '<') {
                return;
            }
            var data = e.detail.substr(1);
            var json = JSON.parse(data);
            for (var i = 0, cb; cb = onCollector[i]; i++) {
                cb(json);
            }
        };
        mono.addon = {
            port: {
                emit: function (pageId, message) {
                    var msg = '>' + JSON.stringify(message);
                    window.postMessage(msg, "*");
                },
                on: function (pageId, func) {
                    onCollector.push(func);
                    if (onCollector.length > 1) {
                        return;
                    }
                    window.addEventListener('monoMessage', onMessage);
                },
                removeListener: function(pageId, func) {
                    var pos = onCollector.indexOf(func);
                    if (pos === -1) {
                        return;
                    }
                    onCollector.splice(pos, 1);
                    if (onCollector.length !== 0) {
                        return;
                    }
                    window.removeEventListener('monoMessage', onMessage);
                }
            }
        }
    }

    var firefoxMsg = {
        cbList: [],
        mkResponse: function (pageId) {
            return function (message) {
                firefoxMsg.sendTo(message, pageId);
            }
        },
        onMessage: function (msg) {
            var response = firefoxMsg.mkResponse(msg.from);
            for (var i = 0, cb; cb = firefoxMsg.cbList[i]; i++) {
                cb(msg, response);
            }
        },
        on: function (cb) {
            firefoxMsg.cbList.push(cb);
            if (firefoxMsg.cbList.length !== 1) {
                return;
            }
            mono.addon.port.on('mono', firefoxMsg.onMessage);
        },
        off: function(cb) {
            var cbList = firefoxMsg.cbList;
            var pos = cbList.indexOf(cb);
            if (pos === -1) {
                return;
            }
            cbList.splice(pos, 1);
            if (cbList.length !== 0) {
                return;
            }
            mono.addon.port.removeListener('mono', firefoxMsg.onMessage);
        },
        send: function (message) {
            mono.addon.port.emit('mono', message);
        },
        sendTo: function (message, to) {
            message.to = to;
            mono.addon.port.emit('mono', message);
        },
        sendToActiveTab: function (message) {
            message.hook = 'activeTab';
            firefoxMsg.sendTo(message);
        }
    };

    mono.onMessage.on = firefoxMsg.on;
    mono.onMessage.off = firefoxMsg.off;
    mono.sendMessage.send = firefoxMsg.send;
    mono.sendMessage.sendToActiveTab = firefoxMsg.sendToActiveTab;
};