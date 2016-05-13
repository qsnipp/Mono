mono.msgList.chrome = function () {
    var lowLevelHook = {};

    var chromeMsg = {
        cbList: [],
        mkResponse: function (sender) {
            if (sender.tab && sender.tab.id >= 0) {
                // send to tab
                return function (message) {
                    chromeMsg.sendTo(message, sender.tab.id);
                }
            }
            //@if chromeUseDirectMsg=1>
            if (sender.monoDirect) {
                return function (message) {
                    sender(mono.cloneObj(message), chromeMsg.onMessage);
                };
            }
            //@if chromeUseDirectMsg=1<
            return function (message) {
                // send to extension
                chromeMsg.send(message);
            }
        },
        sendTo: function (message, tabId) {
            chrome.tabs.sendMessage(tabId, message);
        },
        onMessage: function (message, sender, _response) {
            if (mono.isChromeBgPage) {
                if (message.fromBgPage === 1) {
                    // block msg's from bg page to bg page.
                    return;
                }
            } else
            if (message.toBgPage === 1) {
                // block msg to bg page not in bg page.
                return;
            }

            if (message.hook !== undefined) {
                var hookFunc = lowLevelHook[message.hook];
                if (hookFunc !== undefined) {
                    return hookFunc(message, sender, _response);
                }
            }

            var response = chromeMsg.mkResponse(sender);
            for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
                cb(message, response);
            }
        },
        on: function (cb) {
            chromeMsg.cbList.push(cb);
            if (chromeMsg.cbList.length !== 1) {
                return;
            }
            chrome.runtime.onMessage.addListener(chromeMsg.onMessage);
        },
        off: function(cb) {
            var cbList = chromeMsg.cbList;
            var pos = cbList.indexOf(cb);
            if (pos === -1) {
                return;
            }
            cbList.splice(pos, 1);
            if (cbList.length !== 0) {
                return;
            }
            chrome.runtime.onMessage.removeListener(chromeMsg.onMessage);
        },
        sendToActiveTab: function (message) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                if (tabs[0] === undefined || tabs[0].id < 0) {
                    return;
                }
                chromeMsg.sendTo(message, tabs[0].id);
            });
        },
        send: function (message) {
            if (mono.isChromeBgPage) {
                message.fromBgPage = 1;
            } else {
                message.toBgPage = 1;
            }
            chrome.runtime.sendMessage(message);
        }
    };

    chromeMsg.on.lowLevelHook = lowLevelHook;

    if (chrome.runtime.hasOwnProperty('getBackgroundPage')) {
        mono.isChromeBgPage = location.href.indexOf('_generated_background_page.html') !== -1;

        //@if chromeForceDefineBgPage=1||chromeUseDirectMsg=1>
        var onGetBackgroundPage = function(bgWin) {
            if (bgWin !== window) {
                delete mono.isChromeBgPage;
            } else {
                mono.isChromeBgPage = true;
            }

            //@if chromeUseDirectMsg=1>
            if (!mono.isChromeBgPage) {
                chromeMsg.onMessage.monoDirect = true;
                chromeMsg.send = mono.sendMessage.send = function (message) {
                    bgWin.mono.chromeDirectOnMessage(mono.cloneObj(message), chromeMsg.onMessage);
                }
            } else
            if (mono.chromeDirectOnMessage === undefined) {
                mono.chromeDirectOnMessage = function (message, sender) {
                    chromeMsg.onMessage(message, sender);
                };
            }
            //@if chromeUseDirectMsg=1<
        };
        try {
            chrome.runtime.getBackgroundPage(onGetBackgroundPage);
        } catch (e){}
        //@if chromeForceDefineBgPage=1||chromeUseDirectMsg=1<
    }

    mono.onMessage.on = chromeMsg.on;
    mono.onMessage.off = chromeMsg.off;
    mono.sendMessage.send = chromeMsg.send;
    mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
};