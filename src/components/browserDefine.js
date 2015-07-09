(function () {
    //@if1 useFf=1>
    if (typeof window === 'undefined') {
        //@include browserDefine/firefoxModule.js
        return;
    }
    //@if1 useFf=1<

    //@if1 useGm=1>
    if (typeof GM_getValue !== 'undefined') {
        //@include browserDefine/gm.js
        return;
    }
    //@if1 useGm=1<

    //@if1 useChrome=1>
    if (window.hasOwnProperty('chrome')) {
        //@include browserDefine/chrome.js

        //@if1 useChromeApp=1>
        if (!chrome.app.hasOwnProperty('getDetails')) {
            //@include browserDefine/chromeApp.js
        }
        //@if1 useChromeApp=1<

        //@if1 useChromeWebApp=1>
        if (chrome.app.hasOwnProperty('getDetails')) {
            mono.isChromeWebApp = chrome.app.getDetails();
            if (mono.isChromeWebApp && mono.isChromeWebApp.hasOwnProperty('app')) {
                //@include browserDefine/chromeWebApp.js
            } else {
                delete mono.isChromeWebApp;
            }
        }
        //@if1 useChromeWebApp=1<
        return;
    }
    //@if1 useChrome=1<

    //@if1 useOpera=1>
    if (window.hasOwnProperty('opera')) {
        //@include browserDefine/opera.js
        return;
    }
    //@if1 useOpera=1<

    //@if1 useFf=1>
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
        //@include browserDefine/firefoxNoModule.js
        return;
    }
    //@if1 useFf=1<

    //@if1 useSafari=1>
    if (window.hasOwnProperty('safari')) {
        //@include browserDefine/safari.js
        return;
    }
    if (navigator.userAgent.indexOf('Safari/') !== -1) {
        // Safari bug!
        mono.isSafari = true;
        return;
    }
    //@if1 useSafari=1<

    console.error('Mono: can\'t define browser!');
})();