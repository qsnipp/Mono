/**
 *
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 *
 **/

var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function (window, base, factory) {
    "use strict";
    if (mono && mono.isLoaded) {
        return;
    }

    if (typeof window !== "undefined") {
        return mono = base(factory.bind(null, null, factory), mono);
    }

    //@if useFf=1>
    exports.isFF = true;
    exports.isModule = true;

    exports.init = factory;
    //@if useFf=1<
}(
    typeof window !== "undefined" ? window : undefined,
    function base(factory, _mono) {
        //@if useGm=1>
        if (typeof GM_getValue !== 'undefined') {
            return factory(null, _mono);
        }
        //@if useGm=1<

        var objCreate = function(o) {
            if (typeof Object.create === 'function') {
                return Object.create(o);
            }
            var a = function(){};a.prototype = o;return new a();
        };

        var base = objCreate({
            isLoaded: true,
            onReadyStack: [],
            onReady: function() {
                base.onReadyStack.push([this, arguments]);
            }
        });

        var onLoad = function() {
            document.removeEventListener('DOMContentLoaded', onLoad, false);
            window.removeEventListener('load', onLoad, false);

            mono = factory(null, _mono);

            for (var key in base) {
                if (base.hasOwnProperty(key)) {
                    mono[key] = base[key];
                }
            }

            var item;
            while(item = base.onReadyStack.shift()) {
                mono.onReady.apply(item[0], item[1]);
            }
        };

        if (['interactive','complete'].indexOf(document.readyState) !== -1) {
            return factory(null, _mono);
        }

        document.addEventListener('DOMContentLoaded', onLoad, false);
        window.addEventListener('load', onLoad, false);

        return base;
    },
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
            storageList: {},
            onReady: function(cb) {
                cb();
            }
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

        var initFunc = mono.msgList[mono.msgType];
        if (initFunc !== undefined) {
            initFunc();
        } else {
            console.error('Msg transport is not defined!');
        }
        initFunc = undefined;
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

        initFunc = mono.storageList[mono.storageType];
        if (initFunc !== undefined) {
            initFunc();
        } else {
            console.error('Storage is not defined!');
        }
        initFunc = undefined;
        mono.storageList = undefined;

        //@insert

        return mono;
    }
));