/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine. Firefox lib.
 *
 */

(function() {
  var map = {};
  /**
   * @namespace exports
   * @namespace require
   */

  /**
   * type {function}
   * @returns {number}
   */
  var getPageId = function() {
    if (getPageId.value === undefined) {
      getPageId.value = -1;
    }
    return ++getPageId.value;
  };

  var getMonoPage = function(page) {
    for (var index in map) {
      if (map[index].page === page) {
        return map[index];
      }
    }
    return undefined;
  };

  var virtualPageList = [];
  exports.virtualAddon = function() {
    var subscribClientList = {};
    var subscribServerList = {};
    var obj = {
      port: {
        emit: function(to, message) {
          var list = subscribServerList[to];
          if (list === undefined) {
            return;
          }
          for (var i = 0, item; item = list[i]; i++) {
            item(message);
          }
        },
        on: function(to, cb) {
          if (subscribClientList[to] === undefined) {
            subscribClientList[to] = [];
          }
          subscribClientList[to].push(cb);
        }
      },
      lib: {
        emit: function(to, message) {
          var list = subscribClientList[to];
          if (list === undefined) {
            return;
          }
          for (var i = 0, item; item = list[i]; i++) {
            item(message);
          }
        },
        on: function(to, cb) {
          if (subscribServerList[to] === undefined) {
            subscribServerList[to] = [];
          }
          subscribServerList[to].push(cb);
        }
      },
      isVirtual: true
    };
    virtualPageList.push(obj);
    return obj;
  };

  exports.virtualPort = function() {
    window.addEventListener('message', function(e) {
      if (e.data[0] !== '>') {
        return;
      }
      var json = JSON.parse(e.data.substr(1));
      self.port.emit('mono', json);
    });
    self.port.on('mono', function (message) {
      var msg = '<' + JSON.stringify(message);
      var event = new CustomEvent("monoMessage", {detail: msg});
      window.dispatchEvent(event);
    });
  };

  var bindPage = function(mPage) {
    var page = mPage.page;
    if (page.isVirtual) return;

    var onPageShow = function() {
      mPage.active = true;
    };
    var onPageHide = function() {
      mPage.active = false;
    };
    var onAttach = function() {
      mPage.active = true;
      map[mPage.id] = mPage;
    };
    var onDetach = function() {
      delete map[mPage.id];
      mPage.active = false;
    };

    page.on('pageshow', onPageShow);
    page.on('pagehide', onPageHide);
    page.on('attach', onAttach);
    page.on('detach', onDetach);
  };

  var sendHook = {
    activeTab: function(message) {
      var tabs = require("sdk/tabs");
      var currentTab = tabs.activeTab;
      var pageId;
      for (var index in map) {
        if (map[index].page.tab === currentTab && map[index].page.url === currentTab.url) {
          pageId = map[index].id;
          break;
        }
      }
      if (pageId === undefined) {
        return;
      }
      message.to = pageId;
      monoOnMessage(message);
    }
  };

  var monoOnMessage = function(message) {
    if (message.hook !== undefined) {
      var hookFunc = sendHook[message.hook];
      if (hookFunc !== undefined) {
        delete message.hook;
        return hookFunc(message);
      }
    }
    if (message.to !== undefined) {
      var mPage = map[message.to];
      if (!mPage || mPage.active === false) {
        return;
      }
      var type = (mPage.page.isVirtual !== undefined) ? 'lib' : 'port';
      return mPage.page[type].emit('mono', message);
    }
    for (var i = 0, item; item = virtualPageList[i]; i++) {
      item.lib.emit('mono', message);
    }
  };

  exports.addPage = function(page) {
    var mPage = getMonoPage(page);
    if (mPage) {
      return;
    }
    mPage = {
      page: page,
      id: getPageId(),
      active: true
    };
    map[mPage.id] = mPage;

    bindPage(mPage);

    var type = (page.isVirtual !== undefined) ? 'lib' : 'port';
    page[type].on('mono', function(message) {
      message.from = mPage.id;
      monoOnMessage(message);
    });
  };

//@ffLibStorage

//@ffLibUtils

})();