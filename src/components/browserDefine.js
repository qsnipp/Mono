(function() {
  //@strip_firefox_>
  if (typeof window === 'undefined') {
    /**
     * @namespace _require
     */
    //@include define/firefoxModule.js
    return;
  }
  //@strip_firefox_<

  //@strip_gm_>
  if (typeof GM_getValue !== 'undefined') {
    //@include define/gm.js
    return;
  }
  //@strip_gm_<

  //@strip_chrome_>
  if (window.hasOwnProperty('chrome')) {
    //@include define/chrome.js
    //@include define/chromeApp.js
    //@include define/chromeWebApp.js
    return;
  }
  //@strip_chrome_<

  //@strip_opera_>
  if (window.hasOwnProperty('opera')) {
    //@include define/opera.js
    return;
  }
  //@strip_opera_<

  //@strip_firefox_>
  if (navigator.userAgent.indexOf('Firefox') !== -1) {
    //@include define/firefoxNoModule.js
    return;
  }
  //@strip_firefox_<

  //@strip_safari_>
  if (window.hasOwnProperty('safari')) {
    //@include define/safari.js
    return;
  }
  if (navigator.userAgent.indexOf('Safari/') !== -1) {
    // Safari bug!
    mono.isSafari = true;
    return;
  }
  //@strip_safari_<

  console.error('Mono: can\'t define browser!');
})();