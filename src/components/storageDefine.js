/**
 * Created by Anton on 09.07.2015.
 */
(function () {
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
    //@include storageDefine/opera.js
    //@if useOpera=1<
    //@if useLocalStorage=1||useOpera=1<
})();