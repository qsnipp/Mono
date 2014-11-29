console.log("Options page!");
mono.onMessage(function(message, response){
  r = response;
  console.log(arguments);
});

document.addEventListener('DOMContentLoaded', function() {
  var message = document.getElementById('message');
  var send = document.getElementById('send');
  send.addEventListener('click', function() {
    mono.sendMessage(message.value);
  });
});