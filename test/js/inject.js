console.log("Inject page!");
mono.onMessage(function(message, response){
  r = response;
  console.log(arguments);
});