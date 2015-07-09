mono.isFF = true;
if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
    mono.addon = addon;
} else if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
    mono.addon = self;
} else {
    mono.noAddon = true;
}