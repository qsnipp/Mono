mono.msgList.gm = function () {
    var gmMsg = {
        cbList: [],
        onMessage: function (_message) {
            var message = mono.cloneObj(_message);
            var response = gmMsg.onMessage;
            for (var i = 0, cb; cb = gmMsg.cbList[i]; i++) {
                if (this.isBg === cb.isBg) {
                    continue;
                }
                cb(message, response.bind({isBg: cb.isBg}));
            }
        },
        on: function (cb) {
            cb.isBg = this.isBg;
            gmMsg.cbList.push(cb);
        }
    };
    gmMsg.send = gmMsg.onMessage;

    mono.onMessage.on = gmMsg.on;
    mono.sendMessage.send = gmMsg.send;
    mono.sendMessage.sendToActiveTab = gmMsg.onMessage.bind({isBg: true});
};