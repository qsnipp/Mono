console.log("Popup page!");

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
    r = response;
  });
});