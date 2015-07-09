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
        return factory(null, mono);
    }

    //@if browser=firefox>
    exports.isFF = true;
    exports.isModule = true;

    exports.init = factory;
    //@if browser=firefox<
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

        //@if browser=chrome>
        //@include vendor/Chrome/messages.js
        //@if browser=chrome<

        //@if browser=chrome&&oldChromeSupport=1>
        //@include vendor/OldChrome/messages.js
        //@if browser=chrome&&oldChromeSupport=1<

        //@if browser=firefox>
        //@include vendor/Firefox/messages.js
        //@if browser=firefox<

        //@if browser=safari>
        //@include vendor/Safari/messages.js
        //@if browser=safari<

        //@if browser=opera>
        //@include vendor/Opera/messages.js
        //@if browser=opera<

        //@if browser=gm>
        //@include vendor/GM/messages.js
        //@if browser=gm<

        //@include components/storageDefine.js

        //@if browser=firefox>
        //@include vendor/Firefox/storage.js
        //@if browser=firefox<

        //@if browser=gm>
        //@include vendor/GM/storage.js
        //@if browser=gm<

        //@if browser=chrome>
        //@include vendor/Chrome/storage.js
        //@if browser=chrome<

        //@if useLocalStorage=1||browser=opera>
        //@include vendor/Uni/storage.js
        //@if useLocalStorage=1||browser=opera<

        //@insert

        return mono;
    }
));