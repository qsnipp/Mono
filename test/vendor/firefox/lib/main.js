(function() {
    var monoLib = require("./monoLib.js");
    monoLib.flags.enableLocalScope = true;
    var ToggleButton = require('sdk/ui/button/toggle').ToggleButton;
    var panels = require("sdk/panel");
    var self = require("sdk/self");

    var simplePrefs = require("sdk/simple-prefs");
    simplePrefs.on("settingsBtn", function() {
        var tabs = require("sdk/tabs");
        tabs.open( self.data.url('options.html') );
    });

    var pageMod = require("sdk/page-mod");
    pageMod.PageMod({
        include: [
            self.data.url('options.html')
        ],
        contentScript: '('+monoLib.virtualPort.toString()+')()',
        contentScriptWhen: 'start',
        onAttach: function(tab) {
            monoLib.addPage(tab);
        }
    });

    pageMod.PageMod({
        include: [
            'http://ya.ru/*',
            'https://ya.ru/*'
        ],
        contentScriptFile: [
          self.data.url("js/mono.js"),
          self.data.url("js/inject.js")
        ],
        contentScriptWhen: 'start',
        onAttach: function(tab) {
            monoLib.addPage(tab);
        }
    });

    var button = ToggleButton({
        id: "monoTestBtn",
        label: "Mono test!",
        icon: {
            "16": "./icons/icon-16.png"
        },
        onChange: function (state) {
            if (!state.checked) {
                return;
            }
            popup.show({
                position: button
            });
        }
    });

    var popup = panels.Panel({
        width: 400,
        height: 250,
        contentURL: self.data.url("popup.html"),
        onHide: function () {
            button.state('window', {checked: false});
        }
    });
    monoLib.addPage(popup);

    var backgroundPageAddon = monoLib.virtualAddon();
    monoLib.addPage(backgroundPageAddon);

    var backgroundPage = require("./background.js");
    backgroundPage.init(backgroundPageAddon);
})();