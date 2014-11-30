(function() {
  if (mono.isSafari) {
    if (location.href.indexOf('http://ya.ru') !== 0) {
      return;
    }
  }
  console.log("Inject page!");
  mono.onMessage(function(message, response){
    r = response;
    console.log(arguments);
  });
})();