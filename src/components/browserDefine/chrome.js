mono.isChrome = true;
mono.isChromeInject = !chrome.hasOwnProperty('tabs');
mono.msgType = 'chrome';
//@if3 oldChromeSupport=1>
if (!(chrome.hasOwnProperty('runtime') && chrome.runtime.onMessage)) {
    mono.msgType = 'oldChrome';
}
//@if3 oldChromeSupport=1<