mono.msgList.chrome = function () {
    var lowLevelHook = {};

    var chromeMsg = {
        cbList: [],
        mkResponse: function (sender) {
            if (sender.tab) {
                // send to tab
                return function (message) {
                    chromeMsg.sendTo(message, sender.tab.id);
                }
            }
            //@if4 chromeUseDirectMsg=1>
            if (sender.monoDirect) {
                return function (message) {
                    sender(mono.cloneObj(message), chromeMsg.onMessage);
                };
            }
            //@if4 chromeUseDirectMsg=1<
            return function (message) {
                // send to extension
                chromeMsg.send(message);
            }
        },
        sendTo: function (message, tabId) {
            chrome.tabs.sendMessage(tabId, message);
        },
        onMessage: function (message, sender, _response) {
            if (mono.isChromeBgPage === 1) {
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

        //@if4 chromeForceDefineBgPage=1||chromeUseDirectMsg=1>
        chrome.runtime.getBackgroundPage(function (bgWin) {
            if (bgWin !== window) {
                delete mono.isChromeBgPage;
            } else {
                mono.isChromeBgPage = 1;
            }

            //@if4 chromeUseDirectMsg=1>
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
            //@if4 chromeUseDirectMsg=1<
        });
        //@if4 chromeForceDefineBgPage=1||chromeUseDirectMsg=1<
    }

    mono.onMessage.on = chromeMsg.on;
    mono.sendMessage.send = chromeMsg.send;
    mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
};