var page;
console.log(page = "Popup page!");

document.addEventListener('DOMContentLoaded', function() {
  var message = document.getElementById('message');
  var send = document.getElementById('send');
  var output = document.getElementById('output');
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

    if (text === 'hasInject') {
      return mono.sendMessage({action: 'hasInject'});
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
    if (message.to && message.to !== 'popup') return;

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
});