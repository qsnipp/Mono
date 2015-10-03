(function browserDefine () {
    //@if useFf=1>
    //@if oneMode!=1>
    if (typeof window === 'undefined') {
        //@if oneMode!=1<
        //@include browserDefine/firefoxModule.js
        return;
        //@if oneMode!=1>
    }
    //@if oneMode!=1<
    //@if useFf=1<

    //@if useGm=1>
    //@if oneMode!=1>
    if (typeof GM_getValue !== 'undefined') {
        //@if oneMode!=1<
        //@include browserDefine/gm.js
        return;
        //@if oneMode!=1>
    }
    //@if oneMode!=1<
    //@if useGm=1<

    //@if useChrome=1>
    //@if oneMode!=1>
    if (window.chrome !== undefined) {
        //@if oneMode!=1<
        //@include browserDefine/chrome.js

        //@if useChromeApp=1>
        if (!chrome.app.hasOwnProperty('getDetails')) {
            //@include browserDefine/chromeApp.js
        }
        //@if useChromeApp=1<

        //@if useChromeWebApp=1>
        if (chrome.app.hasOwnProperty('getDetails')) {
            var details = chrome.app.getDetails();
            if (details && details.hasOwnProperty('app')) {
                //@include browserDefine/chromeWebApp.js
            }
        }
        //@if useChromeWebApp=1<
        return;
        //@if oneMode!=1>
    }
    //@if oneMode!=1<
    //@if useChrome=1<

    //@if useOpera=1>
    //@if oneMode!=1>
    if (window.opera !== undefined) {
        //@if oneMode!=1<
        //@include browserDefine/opera.js
        return;
        //@if oneMode!=1>
    }
    //@if oneMode!=1<
    //@if useOpera=1<

    //@if useFf=1>
    //@if oneMode!=1>
    if (navigator.userAgent.indexOf('Firefox') !== -1 || typeof InstallTrigger !== 'undefined') {
        //@if oneMode!=1<
        //@include browserDefine/firefoxNoModule.js
        return;
        //@if oneMode!=1>
    }
    //@if oneMode!=1<
    //@if useFf=1<

    //@if useSafari=1>
    //@if oneMode!=1>
    if (window.safari !== undefined) {
        //@if oneMode!=1<
        //@include browserDefine/safari.js
        return;
        //@if oneMode!=1>
    }
    //@if oneMode!=1<
    //@if useSafari=1<

    console.error('Mono: can\'t define browser!');
})();