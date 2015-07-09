if (chrome.app.hasOwnProperty('getDetails')) {
    mono.isChromeWebApp = chrome.app.getDetails();
    if (mono.isChromeWebApp && mono.isChromeWebApp.hasOwnProperty('app')) {
        mono.isChromeWebApp = true;
    } else {
        delete mono.isChromeWebApp;
    }
}