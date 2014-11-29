/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 */

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

  mono.sendMessage = function(message, cb) {
    mono.sendMessage.send(message);
  };

  mono.onMessage = function(cb) {
    mono.onMessage.on(cb);
  };

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
          console.log(arguments)
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
    if (typeof mono === 'undefined' || !mono.isFF) return;

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

  return mono;
}));