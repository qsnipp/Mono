(function() {
  if (typeof window === 'undefined') {
    /**
     * @namespace _require
     */
    //@include define/firefox.js
    return;
  }

  if (typeof GM_getValue !== 'undefined') {
    //@include define/gm.js
    return;
  }

  if (window.hasOwnProperty('chrome')) {
    //@include define/chrome.js
    //@include define/chromeApp.js
    //@include define/chromeWebApp.js
    return;
  }

  if (window.hasOwnProperty('opera')) {
    //@include define/opera.js
    return;
  }

  if (navigator.userAgent.indexOf('Firefox') !== -1) {
    //@include define/firefox.js
    return;
  }

  if (window.hasOwnProperty('safari')) {
    //@include define/safari.js
    return;
  }

  if (navigator.userAgent.indexOf('Safari/') !== -1) {
    // Safari bug!
    mono.isSafari = true;
    return;
  }

  console.error('Mono: can\'t define browser!');
})();