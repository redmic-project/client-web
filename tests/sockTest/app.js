var http = require('http');
var sockjs = require('sockjs');

var Stomp = require('./stomp.js').Stomp;

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
echo.on('connection', function(conn) {
   
    conn.on('data', function(message) {
      var messageObj = Stomp.Frame.unmarshall(message);
      if (messageObj.frames[0].command === "CONNECT") // cambia CONNECT por CONNECTED por compatibilidad de Stomp
	conn.write(Stomp.Frame.marshall(messageObj.frames[0].command + "ED", messageObj.frames[0].headers, messageObj.frames[0].body));
      else if (messageObj.frames[0].command === "SUBSCRIBE") // no devuelve mensaje por compatibilidad de Stomp
	console.log("SUBSCRIBE");
      else if (messageObj.frames[0].command === "SEND") // no devuelve mensaje por compatibilidad de Stomp
	console.log("SEND");
      else
	conn.write(message);
    });
    conn.on('close', function() {});
});

var server = http.createServer();
echo.installHandlers(server, {prefix:'/api/socket'});
server.listen(8080, '127.0.0.1');

/*
// Generated by CoffeeScript 1.10.0
(function() {
  var Stomp, StompServerMock, WebSocketMock, console,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  WebSocketMock = require('./websocket.mock.js').WebSocketMock;

  Stomp = require('./stomp.js').Stomp;

  console = require('console');

  StompServerMock = (function(superClass) {
    extend(StompServerMock, superClass);

    function StompServerMock() {
      this.handle_open = bind(this.handle_open, this);
      this.handle_close = bind(this.handle_close, this);
      this.handle_send = bind(this.handle_send, this);
      return StompServerMock.__super__.constructor.apply(this, arguments);
    }

    StompServerMock.prototype.handle_send = function(msg) {
      return this.stomp_dispatch(Stomp.Frame.unmarshall(msg).frames[0]);
    };

    StompServerMock.prototype.handle_close = function() {
      return this._shutdown();
    };

    StompServerMock.prototype.handle_open = function() {
      this.stomp_init();
      return this._accept();
    };

    StompServerMock.prototype.stomp_init = function() {
      this.transactions = {};
      this.subscriptions = {};
      return this.messages = [];
    };

    StompServerMock.prototype.stomp_send = function(command, headers, body) {
      if (body == null) {
        body = null;
      }
      return this._respond(Stomp.Frame.marshall(command, headers, body));
    };

    StompServerMock.prototype.stomp_send_receipt = function(frame) {
      if (frame.headers.message != null) {
        return this.stomp_send("ERROR", {
          'receipt-id': frame.headers['receipt-id'],
          'message': frame.headers.message
        });
      } else {
        return this.stomp_send("RECEIPT", {
          'receipt-id': frame.headers['receipt-id']
        });
      }
    };

    StompServerMock.prototype.stomp_send_message = function(destination, subscription, message_id, body) {
      return this.stomp_send("MESSAGE", {
        'destination': destination,
        'message-id': message_id,
        'subscription': subscription
      }, body);
    };

    StompServerMock.prototype.stomp_dispatch = function(frame) {
      var handler;
      handler = "stomp_handle_" + (frame.command.toLowerCase());
      if (this[handler] != null) {
        this[handler](frame);
        if (frame.receipt) {
          return this.stomp_send_receipt(frame);
        }
      } else {
        return console.log("StompServerMock: Unknown command: " + frame.command);
      }
    };

    StompServerMock.prototype.stomp_handle_connect = function(frame) {
      this.session_id = Math.random();
      return this.stomp_send("CONNECTED", {
        'session': this.session_id
      });
    };

    StompServerMock.prototype.stomp_handle_begin = function(frame) {
      return this.transactions[frame.headers.transaction] = [];
    };

    StompServerMock.prototype.stomp_handle_commit = function(frame) {
      var i, len, transaction;
      transaction = this.transactions[frame.headers.transaction];
      for (i = 0, len = transaction.length; i < len; i++) {
        frame = transaction[i];
        this.messages.push(frame.body);
      }
      return delete this.transactions[frame.headers.transaction];
    };

    StompServerMock.prototype.stomp_handle_abort = function(frame) {
      return delete this.transactions[frame.headers.transaction];
    };

    StompServerMock.prototype.stomp_handle_send = function(frame) {
      if (frame.headers.transaction) {
        return this.transactions[frame.headers.transaction].push(frame);
      } else {
        return this.messages.push(frame);
      }
    };

    StompServerMock.prototype.stomp_handle_subscribe = function(frame) {
      var cb, sub_id;
      sub_id = frame.headers.id || Math.random();
      cb = (function(_this) {
        return function(id, body) {
          return _this.stomp_send_message(frame.headers.destination, sub_id, id, body);
        };
      })(this);
      return this.subscriptions[sub_id] = [frame.headers.destination, cb];
    };

    StompServerMock.prototype.stomp_handle_unsubscribe = function(frame) {
      var ref;
      if (ref = frame.headers.id, indexOf.call(Object.keys(this.subscriptions), ref) >= 0) {
        return delete this.subscriptions[frame.headers.id];
      } else {
        return frame.headers.message = "Subscription does not exist";
      }
    };

    StompServerMock.prototype.stomp_handle_disconnect = function(frame) {
      return this._shutdown();
    };

    StompServerMock.prototype.test_send = function(sub_id, message) {
      var msgid;
      msgid = 'msg-' + Math.random();
      return this.subscriptions[sub_id][1](msgid, message);
    };

    return StompServerMock;

  })(WebSocketMock);

  exports.StompServerMock = StompServerMock;

}).call(this);*/
