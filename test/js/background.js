(function() {
    if (typeof window !== 'undefined') return;
    window = require('sdk/window/utils').getMostRecentBrowserWindow();
    window.isModule = true;
    var self = require('sdk/self');
    mono = require('toolkit/loader').main(require('toolkit/loader').Loader({
        paths: {
            'data/': self.data.url('js/')
        },
        name: self.name,
        prefixURI: 'resource://'+self.id.slice(1, -1)+'/',
        globals: {
            console: console,
            _require: function(path) {
                switch (path) {
                    case 'sdk/simple-storage':
                        return require('sdk/simple-storage');
                    case 'sdk/window/utils':
                        return require('sdk/window/utils');
                    case 'sdk/self':
                        return require('sdk/self');
                    default:
                        console.log('Module not found!', path);
                }
            }
        }
    }), "data/mono");
})();

var msgLog = [];
var test = function() {
    mono.sendMessageToActiveTab({message: 'BG, Just message'});
    mono.sendMessageToActiveTab({message: 'BG, message with response!', response: 1}, function(message) {
        msgLog.push(['BG, get response', message]);
    });
    mono.storage.get(['bgTest', 'bgObj'], function(data) {
        msgLog.push(['BG, storage, old', data]);
        mono.storage.set({bgTest: Date.now(), bgObj: {test: 1, test2: true, test3: 'yep'}}, function() {
            mono.storage.get(['bgTest', 'bgObj'], function(data) {
                msgLog.push(['BG, storage, new', data]);
            });
        });
    });
};

var init = function(addon) {
    if (addon) {
        mono = mono.init(addon);
    }
    console.log("Background page!");

    var _msgListPush = msgLog.push;
    msgLog.push = function() {
        _msgListPush.call(msgLog, arguments[0]);
        console.error('inLog', JSON.stringify(arguments[0]));
    };
    var _sendMessage = mono.sendMessage;
    var _sendMessageToActiveTab = mono.sendMessageToActiveTab;
    mono.sendMessage = function() {
        msgLog.push(['BG, send', arguments[0]]);
        _sendMessage.apply(this, arguments);
    };
    mono.sendMessage.sendToActiveTab = _sendMessage.sendToActiveTab;
    mono.sendMessageToActiveTab = function() {
        msgLog.push(['BG, sendToActiveTab', arguments[0]]);
        _sendMessageToActiveTab.apply(this, arguments);
    };

    mono.onMessage.call({isBg: true}, function(message, response){
        if (message === 'bgTest') {
            return test();
        }
        if (message === 'getLog') {
            return response(JSON.stringify(msgLog));
        }
        if (message.inLog) {
            return msgLog.push(message.message);
        }

        msgLog.push(['BG, input', message]);

        if (message.toActiveTab) {
            delete message.toActiveTab;
            mono.sendMessageToActiveTab(message, function() {
                msgLog.push(['BG, get responseFromActiveTab', arguments[0]]);
                response.apply(this, arguments);
            });
            return;
        }

        if (message.response) {
            return response({message: 'BG, Response'});
        }
    });

    if (mono.isSafariBgPage) {
        safari.extension.settings.addEventListener('change', function(event){
            if (event.key === 'open_options') {
                var sWindow = safari.application.activeBrowserWindow;
                var tab = sWindow.openTab();
                tab.url = safari.extension.baseURI + 'options.html';
                tab.activate();
            }
        });
    }
};

if (window.isModule) {
    /**
     * @namespace exports
     */
    exports.init = init;
} else {
    init();
}