mono.msgList.opera = function () {
    var inLocalScope = window.location && window.location.href && window.location.href.substr(0, 9) === 'widget://';

    var operaMsg = {
        cbList: [],
        mkResponse: function (source) {
            return function (message) {
                operaMsg.sendTo(message, source);
            }
        },
        sendTo: function (message, source) {
            try {
                source.postMessage(message);
            } catch (e) {
            }
        },
        on: function (cb) {
            operaMsg.cbList.push(cb);
            if (operaMsg.cbList.length !== 1) {
                return;
            }
            opera.extension.onmessage = function (event) {
                var message = event.data;
                if (message.toLocalScope === 1 && inLocalScope === false) return;
                var response = operaMsg.mkResponse(event.source);
                for (var i = 0, cb; cb = operaMsg.cbList[i]; i++) {
                    cb(message, response);
                }
            }
        },
        off: function(cb) {
            var cbList = operaMsg.cbList;
            var pos = cbList.indexOf(cb);
            if (pos === -1) {
                return;
            }
            cbList.splice(pos, 1);
            if (cbList.length !== 0) {
                return;
            }
            opera.extension.onmessage = undefined;
        },
        sendToActiveTab: function (message) {
            var currentTab = opera.extension.tabs.getSelected();
            operaMsg.sendTo(message, currentTab);
        },
        send: mono.isOperaInject ? function (message) {
            operaMsg.sendTo(message, opera.extension);
        } : function (message) {
            message.toLocalScope = 1;
            opera.extension.broadcastMessage(message);
        }
    };

    mono.onMessage.on = operaMsg.on;
    mono.onMessage.off = operaMsg.off;
    mono.sendMessage.send = operaMsg.send;
    mono.sendMessage.sendToActiveTab = operaMsg.sendToActiveTab;

    mono.useMsgOnReady();
};