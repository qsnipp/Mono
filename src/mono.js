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

var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function(window, factory) {
  if (mono) {
    return;
  }

  if (window) {
    return mono = factory();
  }

  exports.isFF = true;
  exports.isModule = true;

  exports.init = factory;
}(typeof window !== "undefined" ? window : undefined, function (_addon) {
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

  //@include components/browserDefine.js

  mono.cloneObj = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  //@include components/msgTools.js

  //@include vendor/Chrome/messages.js
  //@include vendor/Firefox/messages.js
  //@include vendor/OldChrome/messages.js
  //@include vendor/Safari/messages.js
  //@include vendor/Opera/messages.js
  //@include vendor/GM/messages.js

  //@include vendor/Chrome/storage.js
  //@include vendor/Firefox/storage.js
  //@include vendor/GM/storage.js
  //@include vendor/Uni/storage.js

  //@insert

  return mono;
}));