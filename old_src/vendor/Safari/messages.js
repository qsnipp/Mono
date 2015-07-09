(function() {
  if (!mono.isSafari) return;

  var localUrl, localUrlLen;
  if (mono.isSafariBgPage && window.location && window.location.href) {
    localUrl = window.location.href.substr(0, window.location.href.indexOf('/', 19));
    localUrlLen = localUrl.length;
  }

  var safariMsg = {
    cbList: [],
    mkResponse: !mono.isSafariBgPage ? function() {
      return function(message) {
        safariMsg.send(message);
      }
    } : function(source) {
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
        message: mono.cloneObj(message),
        target: {
          page: {
            dispatchMessage: function(name, message) {
              mono.safariDirectOnMessage({message: mono.cloneObj(message)});
            }
          }
        }
      });
    } : mono.isSafariBgPage ? function(message) {
      for (var p = 0, popup; popup = safari.extension.popovers[p]; p++) {
        popup.contentWindow.mono.safariDirectOnMessage({
          message: mono.cloneObj(message),
          target: {
            page: {
              dispatchMessage: function(name, message) {
                mono.safariDirectOnMessage({message: mono.cloneObj(message)});
              }
            }
          }
        });
      }
      for (var w = 0, window; window = safari.application.browserWindows[w]; w++) {
        for (var t = 0, tab; tab = window.tabs[t]; t++) {
          if (tab.url && tab.url.substr(0, localUrlLen) === localUrl) {
            safariMsg.sendTo(message, tab);
          }
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