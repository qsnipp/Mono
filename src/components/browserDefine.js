(function browserDefine () {
    //@if useFf=1>
    if (typeof window === 'undefined') {
        //@include browserDefine/firefoxModule.js
        return;
    }
    //@if useFf=1<

    //@if useGm=1>
    if (typeof GM_getValue !== 'undefined') {
        //@include browserDefine/gm.js
        return;
    }
    //@if useGm=1<

    //@if useChrome=1>
    if (window.hasOwnProperty('chrome')) {
        //@include browserDefine/chrome.js

        //@if useChromeApp=1>
        if (!chrome.app.hasOwnProperty('getDetails')) {
            //@include browserDefine/chromeApp.js
        }
        //@if useChromeApp=1<

        //@if useChromeWebApp=1>
        if (chrome.app.hasOwnProperty('getDetails')) {
            mono.isChromeWebApp = chrome.app.getDetails();
            if (mono.isChromeWebApp && mono.isChromeWebApp.hasOwnProperty('app')) {
                //@include browserDefine/chromeWebApp.js
            } else {
                delete mono.isChromeWebApp;
            }
        }
        //@if useChromeWebApp=1<
        return;
    }
    //@if useChrome=1<

    //@if useOpera=1>
    if (window.hasOwnProperty('opera')) {
        //@include browserDefine/opera.js
        return;
    }
    //@if useOpera=1<

    //@if useFf=1>
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
        //@include browserDefine/firefoxNoModule.js
        return;
    }
    //@if useFf=1<

    //@if useSafari=1>
    if (window.hasOwnProperty('safari')) {
        //@include browserDefine/safari.js
        return;
    }
    if (navigator.userAgent.indexOf('Safari/') !== -1) {
        // Safari bug!
        mono.isSafari = true;
        return;
    }
    //@if useSafari=1<

    console.error('Mono: can\'t define browser!');
})();