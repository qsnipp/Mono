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
        },
        off: function(cb) {
            var cbList = gmMsg.cbList;
            var pos = cbList.indexOf(cb);
            if (pos === -1) {
                return;
            }
            cbList.splice(pos, 1);
        }
    };
    gmMsg.send = gmMsg.onMessage;

    mono.onMessage.on = gmMsg.on;
    mono.onMessage.off = gmMsg.off;
    mono.sendMessage.send = gmMsg.send;
    mono.sendMessage.sendToActiveTab = gmMsg.onMessage.bind({isBg: true});
};