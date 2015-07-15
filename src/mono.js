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

        /**
         * Mono
         * @type {{
         * isLoaded: Boolean,
         * msgType: string,
         * storageType: string,
         * isModule: Boolean,
         * isFF: Boolean,
         * isGM: Boolean,
         * isTM: Boolean,
         * isChrome: Boolean,
         * isChromeApp: Boolean,
         * isChromeWebApp: Boolean,
         * isChromeInject: Boolean,
         * isSafari: Boolean,
         * isSafariPopup: Boolean,
         * isSafariBgPage: Boolean,
         * isSafariInject: Boolean,
         * isOpera: Boolean,
         * isOperaInject: Boolean,
         * messageStack: number,
         * cloneObj: Function,
         * msgClearStack: Function,
         * msgRemoveCbById: Function,
         * sendMessage: Function,
         * sendMessageToActiveTab: Function,
         * sendHook: Object,
         * onMessage: Function
         * storage: Object
         * }}
         */
        var mono = {
            isLoaded: true,
            emptyFunc: function(){},
            msgType: undefined,
            storageType: undefined,
            msgList: {},
            storageList: {}
        };

        //@if true=false>
        0 !== 0 && (window.mono = mono);
        //@if true=false<

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

        //@if useGm=1>
        //@include vendor/GM/messages.js
        //@if useGm=1<

        var func = mono.msgList[mono.msgType];
        if (func !== undefined) {
            func();
        } else {
            console.error('Msg transport is not defined!');
        }
        func = undefined;
        mono.msgList = undefined;

        //@include components/storageDefine.js

        //@if useFf=1>
        //@include vendor/Firefox/storage.js
        //@if useFf=1<

        //@if useGm=1>
        //@include vendor/GM/storage.js
        //@if useGm=1<

        //@if useChrome=1>
        //@include vendor/Chrome/storage.js
        //@if useChrome=1<

        //@if useLocalStorage=1||useOpera=1>
        //@include vendor/Uni/storage.js
        //@if useLocalStorage=1||useOpera=1<

        func = mono.storageList[mono.storageType];
        if (func !== undefined) {
            func();
        } else {
            console.error('Storage is not defined!');
        }
        func = undefined;
        mono.storageList = undefined;

        //@insert

        return mono;
    }
));