(function () {
    //@if browser=firefox>
    if (typeof window === 'undefined') {
        //@include define/firefoxModule.js
        return;
    }
    //@if browser=firefox<

    //@if browser=gm>
    if (typeof GM_getValue !== 'undefined') {
        //@include define/gm.js
        return;
    }
    //@if browser=gm<

    //@if browser=chrome>
    if (window.hasOwnProperty('chrome')) {
        //@include define/chrome.js

        //@if chromeExtType=app>
        //@include define/chromeApp.js
        //@if chromeExtType=app<

        //@if chromeExtType=webApp>
        //@include define/chromeWebApp.js
        //@if chromeExtType=webApp<
        return;
    }
    //@if browser=chrome<

    //@if browser=opera>
    if (window.hasOwnProperty('opera')) {
        //@include define/opera.js
        return;
    }
    //@if browser=opera<

    //@if browser=firefox>
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
        //@include define/firefoxNoModule.js
        return;
    }
    //@if browser=firefox<

    //@if browser=safari>
    if (window.hasOwnProperty('safari')) {
        //@include define/safari.js
        return;
    }
    if (navigator.userAgent.indexOf('Safari/') !== -1) {
        // Safari bug!
        mono.isSafari = true;
        return;
    }
    //@if browser=safari<

    console.error('Mono: can\'t define browser!');
})();