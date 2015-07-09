/**
 * Created by Anton on 09.07.2015.
 */
(function () {
    //@if browser=firefox>
    if (mono.isFF) {
        //@include storageDefine/firefox.js
        return;
    }
    //@if browser=firefox<

    //@if browser=gm>
    if (mono.isGM) {
        //@include storageDefine/gm.js
        return;
    }
    //@if browser=gm<

    //@if browser=chrome>
    if (mono.isChrome && chrome.hasOwnProperty('storage')) {
        //@include storageDefine/chromeStorage.js
        return;
    }
    //@if browser=chrome<

    //@if useLocalStorage=1||browser=opera>
    //@include storageDefine/localStorage.js

    //@if browser=opera>
    //@include storageDefine/opera.js
    //@if browser=opera<
    //@if useLocalStorage=1||browser=opera<
})();