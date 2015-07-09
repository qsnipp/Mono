// ==UserScript==
// @exclude     file://*
// ==/UserScript==

/**
 *
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 *
 **/

var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function (window, factory) {
    "use strict";
    if (mono && mono.isLoaded) {
        return;
    }

    if (typeof window !== "undefined") {
        return mono = factory(null, mono);
    }

    //@if useFf=1>
    exports.isFF = true;
    exports.isModule = true;

    exports.init = factory;
    //@if useFf=1<
}(
    typeof window !== "undefined" ? window : undefined,
    function initMono(_addon, _mono) {
        var require;

        var mono = {
            isLoaded: 1,
            emptyFunc: function(){},
            msgType: undefined,
            storageType: undefined,
            msgList: {},
            storageList: {}
        };

        //@include components/browserDefine.js

        /**
         * Clone array or object via JSON
         * @param {object|Array} obj
         * @returns {object|Array}
         */
        mono.cloneObj = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        };

        //@include components/msgTools.js

        //@if useChrome=1>
        //@include vendor/Chrome/messages.js
        //@if useChrome=1<

        //@if useChrome=1&&oldChromeSupport=1>
        //@include vendor/OldChrome/messages.js
        //@if useChrome=1&&oldChromeSupport=1<

        //@if useFf=1>
        //@include vendor/Firefox/messages.js
        //@if useFf=1<

        //@if useSafari=1>
        //@include vendor/Safari/messages.js
        //@if useSafari=1<

        //@if useOpera=1>
        //@include vendor/Opera/messages.js
        //@if useOpera=1<

        //@if useGM=1>
        //@include vendor/GM/messages.js
        //@if useGM=1<

        var func = mono.msgList[mono.msgType];
        if (func !== undefined) {
            func();
            func = undefined;
        } else {
            console.error('Msg transport is not defined!');
        }
        mono.msgList = undefined;

        //@include components/storageDefine.js

        //@if useFf=1>
        //@include vendor/Firefox/storage.js
        //@if useFf=1<

        //@if useGM=1>
        //@include vendor/GM/storage.js
        //@if useGM=1<

        //@if useChrome=1>
        //@include vendor/Chrome/storage.js
        //@if useChrome=1<

        //@if useLocalStorage=1||useOpera=1>
        //@include vendor/Uni/storage.js
        //@if useLocalStorage=1||useOpera=1<

        func = mono.storageList[mono.storageType];
        if (func !== undefined) {
            func();
            func = undefined;
        } else {
            console.error('Storage is not defined!');
        }
        mono.storageList = undefined;

        //@insert

        return mono;
    }
));