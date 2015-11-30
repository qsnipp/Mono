var msgTools = {
    cbObj: {},
    cbStack: [],
    id: 0,
    idPrefix: Math.floor(Math.random() * 1000) + '_',
    aliveTime: 120 * 1000,
    /**
     * Add callback function in cbObj and cbStack
     * @param {object} message - Message
     * @param {function} cb - Callback function
     */
    addCb: function (message, cb) {
        mono.onMessage.count === 0 && mono.onMessage(mono.emptyFunc);

        if (this.cbStack.length > mono.messageStack) {
            this.clean();
        }
        var id = message.callbackId = this.idPrefix + (++this.id);
        this.cbObj[id] = {fn: cb, time: Date.now()};
        this.cbStack.push(id);
    },
    /**
     * Call function from callback list
     * @param {object} message
     */
    callCb: function (message) {
        var cb = this.cbObj[message.responseId];
        if (cb === undefined) return;
        delete this.cbObj[message.responseId];
        this.cbStack.splice(this.cbStack.indexOf(message.responseId), 1);
        cb.fn(message.data);
    },
    /**
     * Response function
     * @param {function} response
     * @param {string} callbackId
     * @param {*} responseMessage
     */
    mkResponse: function (response, callbackId, responseMessage) {
        responseMessage = {
            data: responseMessage,
            responseId: callbackId
        };
        response(responseMessage);
    },
    /**
     * Clear callback stack
     */
    clearCbStack: function () {
        for (var item in this.cbObj) {
            delete this.cbObj[item];
        }
        this.cbStack.splice(0);
    },
    /**
     * Remove item from cbObj and cbStack by cbId
     * @param {string} cbId - Callback id
     */
    removeCb: function (cbId) {
        var cb = this.cbObj[cbId];
        if (cb === undefined) return;
        delete this.cbObj[cbId];
        this.cbStack.splice(this.cbStack.indexOf(cbId), 1);
    },
    /**
     * Remove old callback from cbObj
     * @param {number} [aliveTime] - Keep alive time
     */
    clean: function (aliveTime) {
        var now = Date.now();
        aliveTime = aliveTime || this.aliveTime;
        for (var item in this.cbObj) {
            if (this.cbObj[item].time + aliveTime < now) {
                delete this.cbObj[item];
                this.cbStack.splice(this.cbStack.indexOf(item), 1);
            }
        }
    }
};

mono.messageStack = 50;
mono.msgClearStack = msgTools.clearCbStack.bind(msgTools);
mono.msgRemoveCbById = msgTools.removeCb.bind(msgTools);
mono.msgClean = msgTools.clean.bind(msgTools);

/**
 * Send message if background page - to local pages, or to background page
 * @param {*} message - Message
 * @param {function} [cb] - Callback function
 * @param {string} [hook] - Hook string
 * @returns {*|string} - callback id
 */
mono.sendMessage = function (message, cb, hook) {
    message = {
        data: message,
        hook: hook
    };
    if (cb) {
        msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.send.call(this, message);

    return message.callbackId;
};

/**
 * Send message to active page, background page only
 * @param {*} message - Message
 * @param {function} [cb] - Callback function
 * @param {string} [hook] - Hook string
 * @returns {*|string} - callback id
 */
mono.sendMessageToActiveTab = function (message, cb, hook) {
    message = {
        data: message,
        hook: hook
    };
    if (cb) {
        msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.sendToActiveTab.call(this, message);

    return message.callbackId;
};

/**
 * Mono message hooks
 * @type {{}}
 */
mono.sendHook = {};

/**
 * Listen messages and call callback function
 * @param {function} cb - Callback function
 */
mono.onMessage = function (cb) {
    var index = mono.onMessage.count++;
    var func = mono.onMessage.wrapFunc.bind(this, cb, index);
    cb.monoCbId = index;
    mono.onMessage.on.call(this, mono.onMessage.wrapper[index] = func);
};
mono.onMessage.count = 0;
mono.onMessage.wrapper = {};
mono.onMessage.wrapFunc = function (cb, index, message, response) {
    if (message.data === undefined) {
        return;
    }
    if (message.responseId !== undefined) {
        return msgTools.callCb(message);
    }
    var mResponse;
    if (message.callbackId === undefined) {
        mResponse = mono.emptyFunc;
    } else {
        mResponse = msgTools.mkResponse.bind(msgTools, response.bind(this), message.callbackId);
    }
    if (message.hook !== undefined) {
        if (index !== 0) {
            return;
        }
        var hookFunc = mono.sendHook[message.hook];
        if (hookFunc !== undefined) {
            return hookFunc(message.data, mResponse);
        }
    }
    cb.call(this, message.data, mResponse);
};

/**
 * Remove listener
 * @param {function} cb
 */
mono.offMessage = function (cb) {
    var func = mono.onMessage.wrapper[cb.monoCbId];
    if (func === undefined) {
        return;
    }
    delete mono.onMessage.wrapper[cb.monoCbId];
    delete cb.monoCbId;
    mono.onMessage.off(func);
};