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
            emptyFunc: function(){}
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

        //@include vendor/Chrome/messages.js
        //@include vendor/Firefox/messages.js
        //@include vendor/OldChrome/messages.js
        //@include vendor/Safari/messages.js
        //@include vendor/Opera/messages.js
        //@include vendor/GM/messages.js

        //@include vendor/Chrome/storage.js
        //@include vendor/Firefox/storage.js
        //@include vendor/GM/storage.js
        //@include vendor/Uni/storage.js

        //@insert

        return mono;
    }
));