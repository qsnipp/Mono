if (chrome.app.hasOwnProperty('getDetails')) {
  var details = chrome.app.getDetails();
  if (details && details.hasOwnProperty('app') !== 'undefined') {
    mono.isChromeWebApp = true;
  }
  details = undefined;
}