console.log("Options page!");

document.addEventListener('DOMContentLoaded', function() {
  var message = document.getElementById('message');
  var send = document.getElementById('send');
  var output = document.getElementById('output');
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
});