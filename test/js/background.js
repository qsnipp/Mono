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
        prefixURI: self.data.url().match(/([^:]+:\/\/[^/]+\/)/)[1],
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

var page;
var msgLog = [];
var msgLogPush = msgLog.push;
msgLog.push = function() {
    console.error.apply(console, arguments);
    msgLogPush.apply(msgLog, arguments);
};

var actionList = {
    bgTest: function(message, response) {
        var sendMessageToActiveTab = function() {
            msgLog.push(['[sa]', page, arguments[0]]);
            mono.sendMessageToActiveTab.apply(this, arguments);
        };
        var sendMessage = function() {
            msgLog.push(['[s]', page, arguments[0]]);
            mono.sendMessage.apply(this, arguments);
        };

        sendMessage({text: 'Hi all, from '+page});
        sendMessage({text: 'Hi all, with response, from '+page, response: 1}, function() {
            msgLog.push(['[gr]', page, arguments[0]]);
        });

        sendMessageToActiveTab({text: 'Hi activeTab, from '+page});
        sendMessageToActiveTab({text: 'Hi activeTab, with response, from '+page, response: 1}, function() {
            msgLog.push(['[gr]', page, arguments[0]]);
        });
    },
    msgTest: function(message, response) {
        var sendMessageToActiveTab = function() {
            msgLog.push(['[sa]', page, arguments[0]]);
            mono.sendMessageToActiveTab.apply(this, arguments);
        };
        var sendMessage = function() {
            msgLog.push(['[s]', page, arguments[0]]);
            mono.sendMessage.apply(this, arguments);
        };

        var testTimer1 = setTimeout(function() {
            console.error("[test#1]", '-', 'ERROR!');
        }, 500);
        sendMessageToActiveTab({reSend: 1, message: {action: 'test1'}}, function(response) {
            if (response !== 'OK!') return;
            console.error("[test#1]", '-', 'OK');
            clearTimeout(testTimer1);
        });

        actionList.test2.count = 0;
        setTimeout(function() {
            if (actionList.test2.count !== 2) {
                console.error("[test#2]", '-', 'ERROR!');
            } else {
                console.error("[test#2]", '-', 'OK');
            }
        }, 500);
        sendMessage({reSend: 1, message: {action: 'test2'}});

        var testTimer3 = setTimeout(function() {
            console.error("[test#3]", '-', 'ERROR!');
        }, 500);
        sendMessage({reSend: 1, to: 'options', message: {action: 'test1'}}, function(response) {
            if (response !== 'OK!') return;
            console.error("[test#3]", '-', 'OK');
            clearTimeout(testTimer3);
        });

        var testTimer4 = setTimeout(function() {
            console.error("[test#4]", '-', 'ERROR!');
        }, 500);
        sendMessage({reSend: 1, to: 'popup', message: {action: 'test1'}}, function(response) {
            if (response !== 'OK!') return;
            console.error("[test#4]", '-', 'OK');
            clearTimeout(testTimer4);
        });
    },
    test1: function(message, response) {
        response('OK!');
    },
    test2: function(message, response) {
        actionList.test2.count++;
    }
};

var init = function(addon) {
    if (addon) {
        mono = mono.init(addon);
    }

    console.log(page = "Background page!");

    mono.onMessage.call({isBg: true}, function(message, _response) {
        if (message.inLog) {
            return msgLog.push(message.data);
        }
        msgLog.push(['[i]', page, arguments[0]]);
        var response = function() {
            msgLog.push(['[sr]', page, arguments[0]]);
            _response.apply(this, arguments);
        };

        var fn = actionList[message.action];
        if (fn) {
            return fn(message, response);
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