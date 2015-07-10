mono.msgList.oldChrome = function () {
    var lowLevelHook = {};

    var chromeMsg = {
        cbList: [],
        mkResponse: function (sender, _response) {
            if (sender.tab && sender.tab.id > -1) {
                // send to tab
                return function (message) {
                    chromeMsg.sendTo(message, sender.tab.id);
                }
            }

            return function (message) {
                // send to extension
                _response(message);
            }
        },
        sendTo: function (message, tabId) {
            chrome.tabs.sendRequest(tabId, message, function (message) {
                if (message && message.responseId !== undefined) {
                    return msgTools.callCb(message);
                }
            });
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

            var response = chromeMsg.mkResponse(sender, _response);
            for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
                cb(message, response);
            }
        },
        on: function (cb) {
            chromeMsg.cbList.push(cb);
            if (chromeMsg.cbList.length !== 1) {
                return;
            }
            chrome.extension.onRequest.addListener(chromeMsg.onMessage);
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
            chrome.extension.onRequest.removeListener(chromeMsg.onMessage);
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
            chrome.extension.sendRequest(message, function (message) {
                if (message && message.responseId !== undefined) {
                    return msgTools.callCb(message);
                }
            });
        }
    };

    chromeMsg.on.lowLevelHook = lowLevelHook;

    try {
        if (chrome.runtime.getBackgroundPage !== undefined) {
            mono.isChromeBgPage = location.href.indexOf('_generated_background_page.html') !== -1;

            //@if5 chromeForceDefineBgPage=1>
            chrome.runtime.getBackgroundPage(function (bgWin) {
                if (bgWin !== window) {
                    delete mono.isChromeBgPage;
                } else {
                    mono.isChromeBgPage = 1;
                }
            });
            //@if5 chromeForceDefineBgPage=1<
        }
    } catch (e) {}

    mono.onMessage.on = chromeMsg.on;
    mono.onMessage.off = chromeMsg.off;
    mono.sendMessage.send = chromeMsg.send;
    mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
};