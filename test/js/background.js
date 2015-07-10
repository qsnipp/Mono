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

var pageId = 'bg';

var sendMessage = function (msg) {
    log(pageId, 'send:', msg);
    mono.sendMessage.apply(this, arguments);
};

var sendToActiveTab = function (msg) {
    log(pageId, 'send2tab:', msg);
    mono.sendMessageToActiveTab.apply(this, arguments);
};

var testLog = '[["bg","send2tab:","Active tab single msg"],["bg","send2tab:",{"action":"reply","reply":"Active tab msg with reply"}],["bg","send2tab:",{"action":"send","msg":{"action":"ping"}}],["bg","send:","Send all single msg"],["bg","send:",{"action":"reply","reply":"Send all msg with reply"}],["bg","send:",{"action":"send","msg":{"action":"ping"}}],["options","receive:","Send all single msg"],["popup","receive:","Send all single msg"],["options","receive:",{"action":"reply","reply":"Send all msg with reply"}],["options","reply:","Send all msg with reply"],["bg","reply:","Send all msg with reply"],["popup","receive:",{"action":"reply","reply":"Send all msg with reply"}],["popup","reply:","Send all msg with reply"],["options","receive:",{"action":"send","msg":{"action":"ping"}}],["options","send:",{"action":"ping"}],["bg","receive:",{"action":"ping"}],["bg","reply:","pong"],["options","reply:","pong"],["popup","receive:",{"action":"send","msg":{"action":"ping"}}],["popup","send:",{"action":"ping"}],["bg","receive:",{"action":"ping"}],["bg","reply:","pong"],["popup","reply:","pong"],["inject","receive:","Active tab single msg"],["inject","receive:",{"action":"reply","reply":"Active tab msg with reply"}],["inject","reply:","Active tab msg with reply"],["bg","reply:","Active tab msg with reply"],["inject","receive:",{"action":"send","msg":{"action":"ping"}}],["inject","send:",{"action":"ping"}],["bg","receive:",{"action":"ping"}],["bg","reply:","pong"],["inject","reply:","pong"]]';

var compareList = function(a, b) {
    a = a.map(function(item) {return JSON.stringify(item)});
    b = b.map(function(item) {return JSON.stringify(item)});
    if (a.length !== b.length) {
        return false;
    }

    for (var i = 0, aItem; aItem = a[i]; i++) {
        for (var n = 0, bItem; bItem = b[n]; n++) {
            if (aItem === bItem) {
                b.splice(n, 1);
                break;
            }
        }
    }

    if (b.length !== 0) {
        return false;
    }

    return true;
};

var runAutoTest = function(cb) {
    var pos = log.list.length;
    clearTimeout(runAutoTest.timer);

    sendToActiveTab('Active tab single msg');
    sendToActiveTab({action: 'reply', reply: 'Active tab msg with reply'}, function(msg) {
        log(pageId, 'reply:', msg);
    });

    sendToActiveTab({action: 'send', msg: {action: 'ping'}});

    sendMessage('Send all single msg');
    sendMessage({action: 'reply', reply: 'Send all msg with reply'}, function(msg) {
        log(pageId, 'reply:', msg);
    });

    sendMessage({action: 'send', msg: {action: 'ping'}});

    setTimeout(function() {
        var result = log.list.slice(pos);
        var testResult = JSON.parse(testLog);

        var state = compareList(result, testResult);

        var stateText = 'Test #1 - ';
        if (!state) {
            log('Current result:');
            log(result);
            log('Require result:');
            log(JSON.parse(testLog));

            stateText += 'Error!';
            stateText += '\nCurrent result:\n';
            stateText += JSON.stringify(result).replace(/],\[/g, '],\n[');
            stateText += '\nRequire result:\n';
            stateText += testLog.replace(/],\[/g, '],\n[');
        } else {
            stateText += 'OK!';
        }

        cb.direct(stateText);
    }, 500);
};
runAutoTest.timer;

var actionList = {
    reply: function (msg, response) {
        response(msg.reply);
    },
    send: function (msg, response) {
        sendMessage(msg.msg, response);
    },
    sendToActiveTab: function(msg, response) {
        sendToActiveTab(msg.msg, response);
    },
    autoTest: function(msg, response) {
        runAutoTest(response);
    },
    ping: function(msg, response) {
        response('pong');
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
        log(pageId, 'receive:', message);
        var func = actionList[message.action];
        var _response = function (msg) {
            log(pageId, 'reply:', msg);
            response(msg);
        };
        _response.direct = function (msg) {
            log(pageId, 'reply:', '[skip log]');
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