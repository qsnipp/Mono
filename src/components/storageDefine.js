/**
 * Created by Anton on 09.07.2015.
 */
(function () {
    if (mono.isChrome) {
        if (chrome.hasOwnProperty('storage')) {
            //@include storageDefine/chromeStorage.js
            return;
        }
    }
    
})();