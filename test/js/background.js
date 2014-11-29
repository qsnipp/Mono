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
    mono.onMessage(function(message, response){
        r = response;
        console.log(arguments);
        response('BG! '+Date.now());
    });
};

if (window.isModule) {
    /**
     * @namespace exports
     */
    exports.init = init;
} else {
    init();
}