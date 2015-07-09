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
    mono.sendMessage.send = operaMsg.send;
    mono.sendMessage.sendToActiveTab = operaMsg.sendToActiveTab;
};