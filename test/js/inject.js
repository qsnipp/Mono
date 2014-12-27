// ==UserScript==
// @include     http://ya.ru/*
// @include     https://ya.ru/*
// ==/UserScript==

(function() {
  if (mono.isSafari) {
    if (location.href.indexOf('http://ya.ru') !== 0) {
      return;
    }
  }

  if (mono.isChrome) {
    mono.onMessage.on.lowLevelHook.hasInject = function(message, sender, response) {
      var isFrame = window.top !== window.self;
      response(!isFrame);
    }
  }

  var page;
  console.log(page = "Inject page!");

  var panelCode = function(){/*
   <h1>Inject</h1>
   <textarea cols="30" rows="7" id="output"></textarea>
   <p><input type="text" id="message" /><input type="button" id="send" value="Send" /></p>
  */};

  var onReady = function() {
    var panel = document.createElement('div');
    panel.style.zIndex = 9999;
    panel.style.width = panel.style.height = '260px';
    panel.style.backgroundColor = '#fff';
    panel.style.position = 'absolute';
    panel.style.left = panel.style.top = '100px';
    panel.style.border = '1px solid #ccc';
    panel.style.padding = '5px';

    panel.innerHTML = panelCode.toString().slice(15, -4);
    document.body.appendChild(panel);

    var message = panel.querySelector('#message');
    var send = panel.querySelector('#send');
    var output = panel.querySelector('#output');
    var write = function(message) {
      output.value += message+'\n';
    };
    var onSubmit = function() {
      var text = message.value;
      message.value = '';

      if (text === 'bgTest') {
        write('run bgPage test!');
        return mono.sendMessage({action: 'bgTest'});
      }

      if (text === 'msgTest') {
        write('run msgPage test!');
        return mono.sendMessage({action: 'msgTest'});
      }

      write(['[s]', page, JSON.stringify(text)].join(' '));
      mono.sendMessage({inLog: 1, data: ['[s]', page, text]});
      mono.sendMessage(text);
    };
    message.addEventListener('keydown', function(e) {
      if (e.keyCode === 13) {
        onSubmit();
      }
    });
    send.addEventListener('click', onSubmit);

    mono.onMessage(function(message, _response) {
      write(['[i]', page, JSON.stringify(arguments[0])].join(' '));
      mono.sendMessage({inLog: 1, data: ['[i]', page, arguments[0]]});
      var response = function() {
        write(['[sr]', page, JSON.stringify(arguments[0])].join(' '));
        mono.sendMessage({inLog: 1, data: ['[sr]', page, arguments[0]]});
        _response.apply(this, arguments);
      };
      if (message.response) {
        return response({text: 'Response from '+page, input: message});
      }
      if (message.reSend) {
        return mono.sendMessage(message.message, response);
      }
    });
  };

  var onDomReady = function() {
    document.removeEventListener( "DOMContentLoaded", onDomReady, false );
    window.removeEventListener( "load", onDomReady, false );
    setTimeout(onReady());
  };
  if (document.readyState === 'complete') {
    onReady();
  } else {
    document.addEventListener('DOMContentLoaded', onDomReady, false);
    window.addEventListener('load', onDomReady, false);
  }
})();