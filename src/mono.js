// ==UserScript==
// @exclude     file://*
// ==/UserScript==

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
    } else
    if (navigator.userAgent.indexOf('Safari/') !== -1) {
      mono.isSafari = true;
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
    },
    mkResponse: function(response, callbackId, responseMessage) {
      responseMessage = {
        data: responseMessage,
        responseId: callbackId
      };
      response.call(this, responseMessage);
    }
  };

  mono.sendMessage = function(message, cb, hook) {
    message = {
      data: message,
      hook: hook
    };
    if (cb !== undefined) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.send.call(this, message);
  };

  mono.sendMessageToActiveTab = function(message, cb, hook) {
    message = {
      data: message,
      hook: hook
    };
    if (cb !== undefined) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.sendToActiveTab.call(this, message);
  };

  mono.sendHook = {};

  mono.onMessage = function(cb) {
    var _this = this;
    mono.onMessage.on.call(_this, function(message, response) {
      if (message.responseId !== undefined) {
        return msgTools.callCb(message);
      }
      var mResponse = msgTools.mkResponse.bind(_this, response, message.callbackId);
      if (mono.sendHook[message.hook] !== undefined) {
        return mono.sendHook[message.hook](message.data, mResponse);
      }
      cb.call(_this, message.data, mResponse);
    });
  };

  mono.storage = undefined;

//@chMsg

//@ffMsg

//@sfMsg

//@oMsg

//@gmMsg

//@chStorage

//@ffStorage

//@gmStorage

//@uniStorage

  return mono;
}));