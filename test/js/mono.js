/**
 *
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 *
 **/

var mono = (typeof mono === 'undefined') ? undefined : mono;

(function( window, factory ) {
  if (mono) {
    return;
  }
  if (window) {
    return mono = factory();
  }
  return exports.init = factory;
}(typeof window !== "undefined" ? window : undefined, function ( addon ) {
  var require;

  var mono = {};

  (function() {
    if (typeof window === 'undefined') {
      /**
       * @namespace _require
       */
      require = _require;
      mono.isModule = true;
      mono.isFF = true;
      mono.addon = addon;
      return;
    }

    window.mono = mono;
    if (typeof GM_getValue !== 'undefined') {
      mono.isGM = true;
      if (window.chrome !== undefined) {
        mono.isTM = true;
      }
      return;
    }

    if (window.chrome !== undefined) {
      mono.isChrome = true;
      if (chrome.app.getDetails === undefined) {
        mono.isChromeApp = true;
      } else {
        var details = chrome.app.getDetails();
        if (details && details.app !== undefined) {
          mono.isChromeWebApp = true;
        }
      }
      mono.isChromeInject = chrome.tabs === undefined;
      return;
    }

    if (window.safari !== undefined) {
      mono.isSafari = true;
      mono.isSafariPopup = safari.self.identifier === 'popup';
      mono.isSafariBgPage = safari.self.addEventListener === undefined;
      mono.isSafariInject = !mono.isSafariPopup && safari.application === undefined;
      return;
    }

    if (window.opera !== undefined) {
      mono.isOpera = true;
      mono.isOperaInject = opera.extension.broadcastMessage === undefined;
      return;
    }

    mono.addon = window.addon || window.self;
    if (mono.addon !== undefined && mono.addon.port !== undefined) {
      mono.isFF = true;
    } else
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      mono.isFF = true;
      mono.noAddon = true;
    }
  })();

  mono.messageStack = 50;

  var msgTools = {
    cbObj: {},
    cbStack: [],
    id: 0,
    idPrefix: Math.floor(Math.random()*1000)+'_',
    addCb: function(message, cb) {
      if (msgTools.cbStack.length > mono.messageStack) {
        delete msgTools.cbObj[msgTools.cbStack.shift()];
      }
      var id = message.callbackId = msgTools.idPrefix+(++msgTools.id);
      msgTools.cbObj[id] = cb;
      msgTools.cbStack.push(id);
    },
    callCb: function(message) {
      var cb = msgTools.cbObj[message.responseId];
      if (cb === undefined) return;
      delete msgTools.cbObj[message.responseId];
      msgTools.cbStack.splice(msgTools.cbStack.indexOf(message.responseId), 1);
      cb(message.data);
    }
  };

  mono.sendMessage = function(message, cb) {
    message = {
      data: message
    };
    if (cb !== undefined) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.send.call(this, message);
  };

  mono.onMessage = function(cb) {
    var _this = this;
    mono.onMessage.on.call(_this, function(message, response) {
      if (message && message.responseId !== undefined) {
        return msgTools.callCb(message);
      }
      cb.call(_this, message.data, function(_message) {
        _message = {
          data: _message
        };
        _message.responseId = message.callbackId;
        response.call(_this, _message);
      });
    });
  };

(function() {
  if (!mono.isChrome) return;

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
      if (chromeMsg.cbList.length !== 1) {
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
        mono.addon.port.emit('mono', {message: message, to: pageId});
      }
    },
    on: function(cb) {
      firefoxMsg.cbList.push(cb);
      if (firefoxMsg.cbList.length !== 1) {
        return;
      }
      mono.addon.port.on('mono', function(msg) {
        var message = msg.message;
        var response = firefoxMsg.mkResponse(msg.from);
        for (var i = 0, cb; cb = firefoxMsg.cbList[i]; i++) {
          cb(message, response);
        }
      });
    },
    send: function(message) {
      mono.addon.port.emit('mono', {message: message});
    },
    sendTo: function(message, to) {
      mono.addon.port.emit('mono', {message: message, to: to});
    },
    sendToActiveTab: function(message) {
      firefoxMsg.sendTo(message, 'activeTab');
    }
  };

  mono.onMessage.on = firefoxMsg.on;
  mono.sendMessage.send = firefoxMsg.send;
  mono.sendMessage.sendToActiveTab = firefoxMsg.sendToActiveTab;
})();
(function() {
  if (!mono.isSafari) return;

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
(function() {
  if (!mono.isOpera) return;

  var operaMsg = {
    cbList: [],
    mkResponse: function(source) {
      return function(message) {
        operaMsg.sendTo(message, source);
      }
    },
    sendTo: function(message, source) {
      try {
        source.postMessage(message);
      } catch (e) {}
    },
    on: function(cb) {
      operaMsg.cbList.push(cb);
      if (operaMsg.cbList.length !== 1) {
        return;
      }
      opera.extension.onmessage = function(event) {
        var message = event.data;
        var response = operaMsg.mkResponse(event.source);
        for (var i = 0, cb; cb = operaMsg.cbList[i]; i++) {
          cb(message, response);
        }
      }
    },
    sendToActiveTab: function(message) {
      var currentTab = opera.extension.tabs.getSelected();
      operaMsg.sendTo(message, currentTab);
    },
    send: mono.isOperaInject ? function(message) {
      operaMsg.sendTo(message, opera.extension);
    } : function(message) {
      opera.extension.broadcastMessage(message);
    }
  };

  mono.onMessage.on = operaMsg.on;
  mono.sendMessage.send = operaMsg.send;
  mono.sendMessage.sendToActiveTab = operaMsg.sendToActiveTab;
})();
(function() {
  if (!mono.isGM) return;

  var gmMsg = {
    cbList: [],
    onMessage: function(message) {
      var response = gmMsg.onMessage;
      for (var i = 0, cb; cb = gmMsg.cbList[i]; i++) {
        if (this.isBg === cb.isBg) {
          continue;
        }
        cb(message, response.bind({isBg: cb.isBg}));
      }
    },
    on: function(cb) {
      cb.isBg = this.isBg;
      gmMsg.cbList.push(cb);
    }
  };
  gmMsg.send = gmMsg.onMessage;

  mono.onMessage.on = gmMsg.on;
  mono.sendMessage.send = gmMsg.send;
  mono.sendMessage.sendToActiveTab = gmMsg.send;
})();

  return mono;
}));