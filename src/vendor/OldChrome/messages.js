(function() {
  if (!mono.isChrome || (chrome.runtime && chrome.runtime.onMessage)) return;

  var chromeMsg = {
    cbList: [],
    mkResponse: function(sender, _response) {
      if (sender.tab && sender.tab.id > -1) {
        // send to tab
        return function(message) {
          chromeMsg.sendTo(message, sender.tab.id);
        }
      }

      return function(message) {
        // send to extension
        _response(message);
      }
    },
    sendTo: function(message, tabId) {
      chrome.tabs.sendRequest(tabId, message, function(message) {
        if (message.responseId !== undefined) {
          return msgTools.callCb(message);
        }
      });
    },
    onMessage: function(message, sender, _response) {
      var response = chromeMsg.mkResponse(sender, _response);
      for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
        cb(message, response);
      }
    },
    on: function(cb) {
      chromeMsg.cbList.push(cb);
      if (chromeMsg.cbList.length !== 1) {
        return;
      }
      chrome.extension.onRequest.addListener(chromeMsg.onMessage);
    },
    sendToActiveTab: function(message) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] === undefined || tabs[0].id < 0) {
          return;
        }
        chromeMsg.sendTo(message, tabs[0].id);
      });
    },
    send: function(message) {
      chrome.extension.sendRequest(message, function(message) {
        if (message.responseId !== undefined) {
          return msgTools.callCb(message);
        }
      });
    }
  };

  mono.onMessage.on = chromeMsg.on;
  mono.sendMessage.send = chromeMsg.send;
  mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
})();