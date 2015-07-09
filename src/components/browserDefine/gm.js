mono.isGM = true;
if (window.hasOwnProperty('chrome')) {
    mono.isTM = true;
} else if (navigator.userAgent.indexOf('Maxthon/') !== -1) {
    mono.isVM = true;
} else {
    mono.isGmOnly = true;
}