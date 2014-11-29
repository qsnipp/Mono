(function() {
  if (!mono.isGM) return;

  var gmMsg = {
    cbList: [],
    mkResponse: function(source) {
      return function(message) {
        // do..
      }
    },
    onMessage: function(message) {
      var response = gmMsg.mkResponse(this.isBg);
      for (var i = 0, cb; cb = gmMsg.cbList[i]; i++) {
        cb(message, response);
      }
    },
    on: function(cb) {
      gmMsg.cbList.push(cb);
    },
    send: function(message) {
      gmMsg.onMessage(message);
    }
  };

  gmMsg.sendToActiveTab = gmMsg.send;

  mono.onMessage.on = gmMsg.on;
  mono.sendMessage.send = gmMsg.send;
  mono.sendMessage.sendToActiveTab = gmMsg.sendToActiveTab;
})();