(function() {
  if (!mono.isSafari) return;

  var safariMsg = {
    cbList: [],
    mkResponse: function(source) {
      return function(message) {
        safariMsg.sendTo(message, source);
      }
    },
    sendTo: function(message, source) {
      if (!source.page || !source.page.dispatchMessage) {
        return;
      }
      source.page.dispatchMessage("message", message);
    },
    onMessage: function(event) {
      var message = event.message;
      var response = safariMsg.mkResponse(event.target);
      for (var i = 0, cb; cb = safariMsg.cbList[i]; i++) {
        cb(message, response);
      }
    },
    on: function(cb) {
      safariMsg.cbList.push(cb);
      if (safariMsg.cbList.length !== 1) {
        return;
      }
      if ( (mono.isSafariPopup || mono.isSafariBgPage) && mono.safariDirectOnMessage === undefined ) {
        mono.safariDirectOnMessage = safariMsg.onMessage;
      }
      if (mono.isSafariBgPage) {
        return safari.application.addEventListener("message", safariMsg.onMessage, false);
      }
      safari.self.addEventListener("message", safariMsg.onMessage, false);
    },
    sendToActiveTab: function(message) {
      var currentTab = safari.application.activeBrowserWindow.activeTab;
      safariMsg.sendTo(message, currentTab);
    },
    send: mono.isSafariPopup ? function(message) {
      safari.extension.globalPage.contentWindow.mono.safariDirectOnMessage({
        message: message,
        target: {
          page: {
            dispatchMessage: function(name, message) {
              mono.safariDirectOnMessage({message: message});
            }
          }
        }
      });
    } : mono.isSafariBgPage ? function(message) {
      for (var w = 0, window; window = safari.application.browserWindows[w]; w++) {
        for (var t = 0, tab; tab = window.tabs[t]; t++) {
          safariMsg.sendTo(message, tab);
        }
      }
    } : function(message) {
      safariMsg.sendTo(message, {page: safari.self.tab});
    }
  };

  mono.onMessage.on = safariMsg.on;
  mono.sendMessage.send = safariMsg.send;
  mono.sendMessage.sendToActiveTab = safariMsg.sendToActiveTab;
})();