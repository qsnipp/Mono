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

  var onReady = function() {
    var panel = document.createElement('div');
    panel.style.zIndex = 9999;
    panel.style.width = panel.style.height = '260px';
    panel.style.backgroundColor = '#fff';
    panel.style.position = 'absolute';
    panel.style.left = panel.style.top = '100px';
    panel.style.border = '1px solid #ccc';
    panel.style.padding = '5px';

    var title = document.createElement('h1');
    title.textContent = 'Inject';
    panel.appendChild(title);
    var output = document.createElement('textarea');
    output.cols = 30;
    output.rows = 7;
    panel.appendChild(output);
    var p = document.createElement('p');
    var message = document.createElement('input');
    message.type = 'text';
    p.appendChild(message);
    var send = document.createElement('input');
    send.type = 'button';
    send.value = 'Send';
    p.appendChild(send);
    panel.appendChild(p);
    document.body.appendChild(panel);

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