mono.isGM = true;
mono.msgType = 'gm';
if (window.chrome !== undefined) {
    mono.isTM = true;
} else
if (navigator.userAgent.indexOf('Maxthon/') !== -1) {
    mono.isVM = true;
} else {
    mono.isGmOnly = true;
}