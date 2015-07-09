/**
 * Created by Anton on 09.07.2015.
 */
(function () {
    //@if2 useFf=1>
    if (mono.isFF) {
        //@include storageDefine/firefox.js
        return;
    }
    //@if2 useFf=1<

    //@if2 useGm=1>
    if (mono.isGM) {
        //@include storageDefine/gm.js
        return;
    }
    //@if2 useGm=1<

    //@if2 useChrome=1>
    if (mono.isChrome && chrome.hasOwnProperty('storage')) {
        //@include storageDefine/chromeStorage.js
        return;
    }
    //@if2 useChrome=1<

    //@if2 useLocalStorage=1||useOpera=1>
    //@include storageDefine/localStorage.js

    //@if2 useOpera=1>
    if (typeof widget !== 'undefined') {
        //@include storageDefine/operaPreferences.js
    }
    //@if2 useOpera=1<
    //@if2 useLocalStorage=1||useOpera=1<
})();