/**
 * Created by Anton on 09.07.2015.
 */
exports.ifStrip = function(data, options) {
    options = options || {};
    var startPos = -1;
    var n = 100;
    while (true) {
        n--;
        if (n === 0) {
            return;
        }

        startPos = data.indexOf('//@if', startPos);
        if (startPos === -1) {
            break;
        }

        var str = data.substr(startPos, data.indexOf('>', startPos) - startPos);
        var endPos = data.indexOf(str + '<', startPos);

        var sIf = str.match(/\/\/@if\d*\s+([^><]+)/);

        if (!sIf) {
            continue;
        }

        var ifList = sIf[1].split(/(\|\||&&)/);

        var result = undefined;
        for (var i = 0, item; item = ifList[i]; i++) {
            if (item === '&&') {
                if (!result) {
                    break;
                }
                continue;
            } else
            if (item === '||') {
                if (result) {
                    break;
                }
                continue;
            }
            var keyValue = item.split('=');
            var key = keyValue[0];
            var value = keyValue[1];
            result = options[key] == value;
            console.log(result, key)
        }

        if (!result) {
            data = data.substr(0, startPos) + data.substr(endPos + str.length + 1);
        } else {
            data = data.substr(0, endPos) + data.substr(endPos + str.length + 1);
            data = data.substr(0, startPos) + data.substr(startPos + str.length + 1);
        }
    }

    return data;
};