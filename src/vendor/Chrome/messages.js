(function() {
  if (!mono.isChrome) return;

  var chromeMsg = {
    cbList: [],
    mkResponse: function(sender) {
      if (sender.tab) {
        // send to tab
        return function(message) {
          chromeMsg.sendTo(message, sender.tab.id);
        }
      }
      if (sender.monoDirect) {
        return function(message) {
          sender(message, chromeMsg.onMessage);
        };
      }
      return function(message) {
        // send to extension
        chromeMsg.send(message);
      }
    },
    sendTo: function(message, tabId) {
      chrome.tabs.sendMessage(tabId, message);
    },
    onMessage: function(message, sender) {
      var response = chromeMsg.mkResponse(sender);
      for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
        cb(message, response);
      }
    },
    on: function(cb) {
      chromeMsg.cbList.push(cb);
      if (chromeMsg.cbList.length !== 1) {
        return;
      }
      chrome.runtime.onMessage.addListener(chromeMsg.onMessage);
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

  (function() {
    if (chrome.runtime.getBackgroundPage === undefined) return;

    chrome.runtime.getBackgroundPage(function(bgWin) {
      var isNotBgPage = true;
      if (bgWin === window) {
        isNotBgPage = false;
      }

      if (isNotBgPage) {
        chromeMsg.onMessage.monoDirect = true;
        chromeMsg.send = mono.sendMessage.send = function(message) {
          bgWin.mono.chromeDirectOnMessage(message, chromeMsg.onMessage);
        }
      } else
      if (mono.chromeDirectOnMessage === undefined ) {
        mono.chromeDirectOnMessage = function(message, sender) {
          chromeMsg.onMessage(message, sender);
        };
      }
    });
  })();

  mono.onMessage.on = chromeMsg.on;
  mono.sendMessage.send = chromeMsg.send;
  mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
})();