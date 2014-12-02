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
  console.log("Inject page!");

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
      mono.sendMessage(message.value);
      write('< ' + message.value);
      message.value = '';
    };
    message.addEventListener('keydown', function(e) {
      if (e.keyCode === 13) {
        onSubmit();
      }
    });
    send.addEventListener('click', onSubmit);

    mono.onMessage(function(message, response){
      write('> ' + message);

      r = function(message) {
        console.log('< '+message);
        response(message);
      };
      console.log('> '+message);
      if (message[0] === 'r') {
        response('_r: ' + message);
        console.log('< ' + '_r: ' + message);
        write('< ' + '_r: ' + message);
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