(function () {
    //@if browser=firefox>
    if (typeof window === 'undefined') {
        //@include browserDefine/firefoxModule.js
        return;
    }
    //@if browser=firefox<

    //@if browser=gm>
    if (typeof GM_getValue !== 'undefined') {
        //@include browserDefine/gm.js
        return;
    }
    //@if browser=gm<

    //@if browser=chrome>
    if (window.hasOwnProperty('chrome')) {
        //@include browserDefine/chrome.js

        //@if chromeExtType=app>
        //@include browserDefine/chromeApp.js
        //@if chromeExtType=app<

        //@if chromeExtType=webApp>
        //@include browserDefine/chromeWebApp.js
        //@if chromeExtType=webApp<
        return;
    }
    //@if browser=chrome<

    //@if browser=opera>
    if (window.hasOwnProperty('opera')) {
        //@include browserDefine/opera.js
        return;
    }
    //@if browser=opera<

    //@if browser=firefox>
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
        //@include browserDefine/firefoxNoModule.js
        return;
    }
    //@if browser=firefox<

    //@if browser=safari>
    if (window.hasOwnProperty('safari')) {
        //@include browserDefine/safari.js
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