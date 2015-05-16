mono.isSafari = true;
mono.isSafariPopup = safari.self.identifier === 'popup';
mono.isSafariBgPage = !safari.self.hasOwnProperty('addEventListener');
mono.isSafariInject = !mono.isSafariPopup && !safari.hasOwnProperty('application');