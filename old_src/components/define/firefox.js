mono.isFF = true;
mono.isModule = typeof window === 'undefined';
if (mono.isModule) {
  require = _require;
  mono.addon = _addon;
} else
if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
  mono.addon = addon;
} else
if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
  mono.addon = self;
} else {
  mono.noAddon = true;
}