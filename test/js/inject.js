// ==UserScript==
// @include     http://ya.ru/*
// @include     https://ya.ru/*
// ==/UserScript==

(function () {
    if (mono.isSafari) {
        if (location.href.indexOf('http://ya.ru') !== 0) {
            return;
        }
    }

    console.error("Inject page!");

    var onReady = function () {
        initBase('inject');
    };

    var onDomReady = function () {
        document.removeEventListener("DOMContentLoaded", onDomReady, false);
        window.removeEventListener("load", onDomReady, false);
        onReady();
    };
    if (document.readyState === 'complete') {
        onDomReady();
    } else {
        document.addEventListener('DOMContentLoaded', onDomReady, false);
        window.addEventListener('load', onDomReady, false);
    }
})();