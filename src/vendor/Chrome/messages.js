(function() {
  if (typeof mono === 'undefined' || !mono.isChrome) return;

  var chromeMsg = {
    cbList: [],
    mkResponse: function(sender) {
      if (sender.tab) {
        // send to tab
        return function(message) {
          chrome.tabs.sendMessage(sender.tab.id, message);
        }
      }
      return function(message) {
        // send to extension
        chrome.runtime.sendMessage(sender.id, message);
      }
    },
    sendTo: function(message, tabId) {
      chrome.tabs.sendMessage(tabId, message);
    },
    on: function(cb) {
      chromeMsg.cbList.push(cb);
      if (chromeMsg.cbList.length > 1) {
        return;
      }
      chrome.runtime.onMessage.addListener(function(message, sender) {
        var response = chromeMsg.mkResponse(sender);
        for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
          cb(message, response);
        }
      });
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
      chrome.runtime.sendMessage(message);
    }
  };

  mono.onMessage.on = chromeMsg.on;
  mono.sendMessage.send = chromeMsg.send;
  mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
})();