(function () {
    if (typeof window !== 'undefined') return;
    var self = require('sdk/self');
    mono = require('toolkit/loader').main(require('toolkit/loader').Loader({
        paths: {
            'data/': self.data.url('js/')
        },
        name: self.name,
        prefixURI: self.data.url().match(/([^:]+:\/\/[^/]+\/)/)[1],
        globals: {
            console: console,
            _require: function (path) {
                switch (path) {
                    case 'sdk/simple-storage':
                        return require('sdk/simple-storage');
                    default:
                        console.error('Module not found!', path);
                }
            }
        }
    }), "data/mono");

    var sdk_timers = require("sdk/timers");
    setTimeout = sdk_timers.setTimeout;
    clearTimeout = sdk_timers.clearTimeout;
})();

var sendMessage = function (msg) {
    log('bg', 'send:', msg);
    mono.sendMessage.apply(this, arguments);
};

var actionList = {
    reply: function (msg, response) {
        response(msg.reply);
    },
    send: function (msg, response) {
        sendMessage(msg.msg, response);
    },
    getLog: function (msg, response) {
        response.direct(log.list);
    }
};

var log = function () {
    var msg = [].slice.call(arguments);
    log.list.push(msg);
    var text = JSON.stringify(msg);
    if (mono.isFF) {
        console.error(text);
    } else {
        console.debug(text);
    }
};
log.list = [];

var init = function (addon) {
    if (addon) {
        mono = mono.init(addon);
    }

    console.error(page = "Background page!");

    mono.onMessage.call({isBg: true}, function (message, response) {
        if (message.action === 'inLog') {
            return log.apply(null, message.text);
        }
        log('bg', 'receive:', message);
        var func = actionList[message.action];
        var _response = function (msg) {
            log('bg', 'reply:', msg);
            response(msg);
        };
        _response.direct = function (msg) {
            log('bg', 'reply:', '[skip log]');
            response(msg);
        };
        func && func(message, _response);
    });

    if (mono.isSafariBgPage) {
        safari.extension.settings.addEventListener('change', function (event) {
            if (event.key === 'open_options') {
                var tab = safari.application.activeBrowserWindow.openTab();
                tab.url = safari.extension.baseURI + 'options.html';
                tab.activate();
            }
        });
    }
};

if (mono.isModule) {
    exports.init = init;
} else {
    init();
}