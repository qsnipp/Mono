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

  /**
   * Mono
   * @type {{
   * isModule: Boolean,
   * isFF: Boolean,
   * isGM: Boolean,
   * isTM: Boolean,
   * isChrome: Boolean,
   * isChromeApp: Boolean,
   * isChromeWebApp: Boolean,
   * isChromeInject: Boolean,
   * isSafari: Boolean,
   * isSafariPopup: Boolean,
   * isSafariBgPage: Boolean,
   * isSafariInject: Boolean,
   * isOpera: Boolean,
   * isOperaInject: Boolean,
   * messageStack: number,
   * cloneObj: Function,
   * msgClearStack: Function,
   * msgRemoveCbById: Function,
   * sendMessage: Function,
   * sendMessageToActiveTab: Function,
   * sendHook: Object,
   * onMessage: Function
   * storage: Object
   * }}
   */
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
      mono.isChromeInject = !chrome.hasOwnProperty('tabs');
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
      return;
    }
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      mono.isFF = true;
      mono.noAddon = true;
      return;
    }
    if (navigator.userAgent.indexOf('Safari/') !== -1) {
      // Safari bug!
      mono.isSafari = true;
      return;
    }
    
    console.error('Mono: can\'t define browser!');
  })();

  mono.messageStack = 50;

  /**
   * Clone array or object via JSON
   * @param {object|Array} obj
   * @returns {object|Array}
   */
  mono.cloneObj = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  var msgTools = {
    cbObj: {},
    cbStack: [],
    id: 0,
    idPrefix: Math.floor(Math.random()*1000)+'_',
    /**
     * Add callback function in cbObj and cbStack
     * @param {object} message - Message
     * @param {function} cb - Callback function
     */
    addCb: function(message, cb) {
      mono.onMessage.inited === undefined && mono.onMessage(function(){});

      if (msgTools.cbStack.length > mono.messageStack) {
        msgTools.clean();
      }
      var id = message.callbackId = msgTools.idPrefix+(++msgTools.id);
      msgTools.cbObj[id] = {fn: cb, time: Date.now()};
      msgTools.cbStack.push(id);
    },
    /**
     * Call function from callback list
     * @param {object} message
     */
    callCb: function(message) {
      var cb = msgTools.cbObj[message.responseId];
      if (cb === undefined) return;
      delete msgTools.cbObj[message.responseId];
      msgTools.cbStack.splice(msgTools.cbStack.indexOf(message.responseId), 1);
      cb.fn(message.data);
    },
    /**
     * Response function
     * @param {function} response
     * @param {string} callbackId
     * @param {*} responseMessage
     */
    mkResponse: function(response, callbackId, responseMessage) {
      if (callbackId === undefined) return;

      responseMessage = {
        data: responseMessage,
        responseId: callbackId
      };
      response.call(this, responseMessage);
    },
    /**
     * Clear callback stack
     */
    clearCbStack: function() {
      for (var item in msgTools.cbObj) {
        delete msgTools.cbObj[item];
      }
      msgTools.cbStack.splice(0);
    },
    /**
     * Remove item from cbObj and cbStack by cbId
     * @param {string} cbId - Callback id
     */
    removeCb: function(cbId) {
      var cb = msgTools.cbObj[cbId];
      if (cb === undefined) return;
      delete msgTools.cbObj[cbId];
      msgTools.cbStack.splice(msgTools.cbStack.indexOf(cbId), 1);
    },
    /**
     * Remove old callback from cbObj
     * @param {number} aliveTime - Keep alive time
     */
    clean: function(aliveTime) {
      var now = Date.now();
      aliveTime = aliveTime || 120*1000;
      for (var item in msgTools.cbObj) {
        if (msgTools.cbObj[item].time + aliveTime < now) {
          delete msgTools.cbObj[item];
          msgTools.cbStack.splice(msgTools.cbStack.indexOf(item), 1);
        }
      }
    }
  };

  mono.msgClearStack = msgTools.clearCbStack;
  mono.msgRemoveCbById = msgTools.removeCb;
  mono.msgClean = msgTools.clean;

  /**
   * Send message if background page - to local pages, or to background page
   * @param {*} message - Message
   * @param {function} [cb] - Callback function
   * @param {string} [hook] - Hook string
   * @returns {*|callbackId} - callback id
   */
  mono.sendMessage = function(message, cb, hook) {
    message = {
      data: message,
      hook: hook
    };
    if (cb) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.send.call(this, message);

    return message.callbackId;
  };

  /**
   * Send message to active page, background page only
   * @param {*} message - Message
   * @param {function} [cb] - Callback function
   * @param {string} [hook] - Hook string
   * @returns {*|callbackId} - callback id
   */
  mono.sendMessageToActiveTab = function(message, cb, hook) {
    message = {
      data: message,
      hook: hook
    };
    if (cb) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.sendToActiveTab.call(this, message);

    return message.callbackId;
  };

  /**
   * Mono message hooks
   * @type {{}}
   */
  mono.sendHook = {};

  /**
   * Listen messages and call callback function
   * @param {function} cb - Callback function
   */
  mono.onMessage = function(cb) {
    var _this = this;
    mono.onMessage.inited = 1;
    mono.onMessage.on.call(_this, function(message, response) {
      if (message.responseId !== undefined) {
        return msgTools.callCb(message);
      }
      var mResponse = msgTools.mkResponse.bind(_this, response, message.callbackId);
      if (message.hook !== undefined) {
        var hookFunc = mono.sendHook[message.hook];
        if (hookFunc !== undefined) {
          return mono.sendHook[message.hook](message.data, mResponse);
        }
      }
      cb.call(_this, message.data, mResponse);
    });
  };

  mono.storage = undefined;

//@chMsg

//@ffMsg

//@oldChMsg

//@sfMsg

//@oMsg

//@gmMsg

//@chStorage

//@ffStorage

//@gmStorage

//@uniStorage

  return mono;
}));