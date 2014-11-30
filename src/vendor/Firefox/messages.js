(function() {
  if (!mono.isFF) return;

  (function() {
    if (!mono.noAddon) return;

    var onCollector = [];
    mono.addon = {
      port: {
        emit: function(pageId, message) {
          var msg = '>'+JSON.stringify(message);
          window.postMessage(msg, "*");
        },
        on: function(pageId, onMessage) {
          onCollector.push(onMessage);
          if (onCollector.length > 1) {
            return;
          }
          window.addEventListener('monoMessage', function (e) {
            if (e.detail[0] !== '<') {
              return;
            }
            var data = e.detail.substr(1);
            var json = JSON.parse(data);
            for (var i = 0, cb; cb = onCollector[i]; i++) {
              cb(json);
            }
          });
        }
      }
    }
  })();

  var firefoxMsg = {
    cbList: [],
    mkResponse: function(pageId) {
      return function(message) {
        message.to = pageId;
        mono.addon.port.emit('mono', message);
      }
    },
    on: function(cb) {
      firefoxMsg.cbList.push(cb);
      if (firefoxMsg.cbList.length !== 1) {
        return;
      }
      mono.addon.port.on('mono', function(msg) {
        var response = firefoxMsg.mkResponse(msg.from);
        for (var i = 0, cb; cb = firefoxMsg.cbList[i]; i++) {
          cb(msg, response);
        }
      });
    },
    send: function(message) {
      mono.addon.port.emit('mono', message);
    },
    sendTo: function(message, to) {
      message.to = to;
      mono.addon.port.emit('mono', message);
    },
    sendToActiveTab: function(message) {
      firefoxMsg.sendTo(message, 'activeTab');
    }
  };

  mono.onMessage.on = firefoxMsg.on;
  mono.sendMessage.send = firefoxMsg.send;
  mono.sendMessage.sendToActiveTab = firefoxMsg.sendToActiveTab;
})();