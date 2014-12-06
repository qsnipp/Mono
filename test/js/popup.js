console.log("Popup page!");

var test = function() {
  var from = 'Popup ';
  mono.sendMessage({message: from + 'message'});
  mono.sendMessage({message: from + 'message with response#1!', response: 1}, function(message) {
    mono.sendMessage({inLog: 1, message: [from + 'get response#1', message]});
  });
  mono.sendMessage({message: from + 'message to active tab!', toActiveTab: 1});
  mono.sendMessage({message: from + 'message to active tab with response#2!', toActiveTab: 1, response: 1}, function(message) {
    mono.sendMessage({inLog: 1, message: [from + 'get response#2', message]});
  });
  mono.storage.get(['popupTest', 'popupObj', 'bgTest', 'bgObj'], function(data) {
    mono.sendMessage({inLog: 1, message: [from + ' storage, old', data]});
    mono.storage.set({popupTest: Date.now(), popupObj: {test: 1, test2: true, test3: 'yep'}}, function() {
      mono.storage.get(['popupTest', 'popupObj'], function(data) {
        mono.sendMessage({inLog: 1, message: [from + ' storage, new', data]});
      });
    });
  });
};

document.addEventListener('DOMContentLoaded', function() {
  var message = document.getElementById('message');
  var send = document.getElementById('send');
  var output = document.getElementById('output');
  var write = function(message) {
    output.value += message+'\n';
  };
  var onSubmit = function() {
    if (message.value === 'test') {
      message.value = '';
      return test();
    }
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
    write('> ' + JSON.stringify(message));

    console.log('> '+message);

    mono.sendMessage({inLog: 1, message: ['Popup, input', message]});

    if (message.response) {
      return response({message: 'Popup, Response'});
    }

    if (message[0] === 'r') {
      response('_r: ' + message);
      console.log('< ' + '_r: ' + message);
      write('< ' + '_r: ' + JSON.stringify(message));
    }
  });
});