mono.isSafari = true;
mono.msgType = 'safari';
mono.isSafariPopup = safari.self.identifier === 'popup';
mono.isSafariBgPage = safari.self.addEventListener === undefined;
mono.isSafariInject = !mono.isSafariPopup && safari.application === undefined;