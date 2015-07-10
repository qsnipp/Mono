(function storageDefine () {
    //@if useFf=1>
    if (mono.isFF) {
        //@include storageDefine/firefox.js
        return;
    }
    //@if useFf=1<

    //@if useGm=1>
    if (mono.isGM) {
        //@include storageDefine/gm.js
        return;
    }
    //@if useGm=1<

    //@if useChrome=1>
    if (mono.isChrome && chrome.hasOwnProperty('storage')) {
        //@include storageDefine/chromeStorage.js
        return;
    }
    //@if useChrome=1<

    //@if useLocalStorage=1||useOpera=1>
    //@include storageDefine/localStorage.js

    //@if useOpera=1>
    if (typeof widget !== 'undefined') {
        //@include storageDefine/operaPreferences.js
    }
    //@if useOpera=1<
    //@if useLocalStorage=1||useOpera=1<
})();