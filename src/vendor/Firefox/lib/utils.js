/**
 * @namespace sendHook {object}
 * @namespace monoOnMessage {function}
 * @namespace map {array}
 */
var serviceList = exports.serviceList = {
    resize: function (message) {
        var mPage = map[message.from];
        if (!mPage || mPage.active === false) {
            return;
        }
        var msg = message.data || {};

        if (msg.width) {
            mPage.page.width = msg.width;
        }
        if (msg.height) {
            mPage.page.height = msg.height;
        }
    },
    openTab: function (message) {
        var msg = message.data || {};
        var self = require("sdk/self");
        var tabs = require("sdk/tabs");
        tabs.open((msg.dataUrl) ? self.data.url(msg.url) : msg.url);
    }
};

sendHook.service = function (message) {
    var msg = message.data || {};

    var response = function (responseMessage) {
        if (message.callbackId === undefined) return;

        responseMessage = {
            data: responseMessage,
            to: message.from,
            responseId: message.callbackId
        };
        monoOnMessage(responseMessage);
    };
    var service = serviceList[msg.action];
    if (service !== undefined) {
        service(message, response);
    }
};