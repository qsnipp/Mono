// ==UserScript==
// @include     http://ya.ru/*
// @include     https://ya.ru/*
// ==/UserScript==

/**
 * Created by Anton on 10.07.2015.
 */
var initBase = function (pageId) {
    var log = function () {
        var msg = [].slice.call(arguments);
        log.list.push(msg);
        var text = JSON.stringify(msg);
        output.textContent += (output.textContent.length ? '\n' : '') + text;
        mono.sendMessage({action: 'inLog', text: msg});
    };
    log.list = [];

    var panelCode = function () {/*
     <span>{pageId}</span>
     <textarea style="width: 620px; height: 430px" id="output"></textarea>
     <br/>
     <input type="text" id="message" />
     <input type="button" id="send" value="Send" />
     <input type="button" id="sendAndReply" value="Send and reply" />
     <input type="button" id="sendFromBg" value="Send from bg" />
     */
    }.toString().replace(/\{pageId\}/g, pageId);

    var panel = document.createElement('div');
    var style = {
        zIndex: 9999,
        width: '640px',
        height: '480px',
        backgroundColor: '#fff',
        position: 'absolute',
        left: panel.style.top = '10px',
        border: '1px solid #ccc',
        padding: '5px',
        overflow: 'auto'
    };
    for (var key in style) {
        panel.style[key] = style[key];
    }

    var start = panelCode.indexOf('/*') + 2;
    var end = panelCode.lastIndexOf('*/');
    panel.innerHTML = panelCode.substr(start, end - start);

    document.body.appendChild(panel);

    var message = panel.querySelector('#message');
    var send = panel.querySelector('#send');
    var sendAndReply = panel.querySelector('#sendAndReply');
    var sendFromBg = panel.querySelector('#sendFromBg');
    var output = panel.querySelector('#output');

    var sendMessage = function (msg) {
        log(pageId, 'send:', msg);
        mono.sendMessage.apply(this, arguments);
    };

    var onSubmit = function () {
        var text = message.value;
        message.value = '';
        sendMessage(text);
    };

    send.addEventListener('click', onSubmit);
    message.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) {
            onSubmit();
        }
    });
    sendAndReply.addEventListener('click', function() {
        var text = message.value;
        message.value = '';
        sendMessage({action: 'reply', reply: text});
    });
    sendFromBg.addEventListener('click', function() {
        var text = message.value;
        message.value = '';
        sendMessage({action: 'send', msg: text});
    });

    var actionList = {};

    mono.onMessage(function (message, response) {
        log(pageId, 'receive:', message);
        var func = actionList[message.action];
        func && func(message, function (msg) {
            log(pageId, 'reply:', message);
            response(msg);
        });
    });
};