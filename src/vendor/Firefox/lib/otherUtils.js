serviceList.xhr = function(message, response) {
  var msg = message.data || {};
  if (!serviceList.xhr.xhrList) {
    serviceList.xhr.xhrList = {};
  }
  var xhrList = serviceList.xhr.xhrList;

  var XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;
  var obj = msg.data;
  var xhr = new XMLHttpRequest();
  xhr.open(obj.open[0], obj.open[1], obj.open[2], obj.open[3], obj.open[4]);
  xhr.responseType = obj.responseType;
  if (obj.mimeType) {
    xhr.overrideMimeType(obj.mimeType);
  }
  if (obj.headers) {
    for (var key in obj.headers) {
      xhr.setRequestHeader(key, obj.headers[key]);
    }
  }
  if (obj.responseType) {
    xhr.responseType = obj.responseType;
  }
  xhr.onload = xhr.onerror = function() {
    delete xhrList[obj.id];
    return response({
      status: xhr.status,
      statusText: xhr.statusText,
      response: (obj.responseType)?xhr.response:(obj.safe)?sanitizedHTML(xhr.responseText):xhr.responseText
    });
  };
  xhr.send(obj.data);
  if (obj.id) {
    xhrList[obj.id] = xhr;
  }
};
serviceList.xhrAbort = function(message) {
  var msg = message.data || {};
  var xhrList = serviceList.xhr.xhrList || {};

  var xhr = xhrList[msg.data];
  if (xhr) {
    xhr.abort();
    delete xhrList[msg.data];
  }
};