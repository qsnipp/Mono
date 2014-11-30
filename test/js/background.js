(function() {
    if (typeof window !== 'undefined') return;
    window = require('sdk/window/utils').getMostRecentBrowserWindow();
    window.isModule = true;
    var self = require('sdk/self');
    mono = require('toolkit/loader').main(require('toolkit/loader').Loader({
        paths: {
            'data/': self.data.url('js/')
        },
        name: self.name,
        prefixURI: 'resource://'+self.id.slice(1, -1)+'/',
        globals: {
            console: console,
            _require: function(path) {
                switch (path) {
                    case 'sdk/simple-storage':
                        return require('sdk/simple-storage');
                    case 'sdk/window/utils':
                        return require('sdk/window/utils');
                    case 'sdk/self':
                        return require('sdk/self');
                    default:
                        console.log('Module not found!', path);
                }
            }
        }
    }), "data/mono");
})();

var init = function(addon) {
    if (addon) {
        mono = mono.init(addon);
    }
    console.log("Background page!");
    mono.onMessage.call({isBg: true}, function(message, response){
        r = function(message) {
            console.log('< '+message);
            response(message);
        };
        console.log('> '+message);
    });

    if (mono.isSafariBgPage) {
        safari.extension.settings.addEventListener('change', function(event){
            if (event.key === 'open_options') {
                var sWindow = safari.application.activeBrowserWindow;
                var tab = sWindow.openTab();
                tab.url = safari.extension.baseURI + 'options.html';
                tab.activate();
            }
        });
    }
};

if (window.isModule) {
    /**
     * @namespace exports
     */
    exports.init = init;
} else {
    init();
}