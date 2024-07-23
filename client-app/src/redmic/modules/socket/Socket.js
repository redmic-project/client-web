define([
	'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "src/utils/Credentials"
	, 'sockjs/sockjs.min'

	, 'stomp-websocket/stomp.min'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, Credentials
	, SockJS
) {

	return declare(_Module, {
		//	Summary:
		//		Módulo para gestionar la comunicación a través de sockets
		//	Description:
		//		Crea y mantiene un socket de comunicación con el servidor

		constructor: function(args) {

			this.config = {
				actions: {
					GENERATE_NEW_SUBSCRIPTIONS: "generateNewSubscriptions",
					SEND: "send",
					LOAD_FINISHED: "loadFinished",
					SOCKET_CONNECT: "socketConnect"
				},
				events: {
					SOCKET_CONNECT: "socketConnect"
				},
				ownChannel: "socket",

				_socketTarget: redmicConfig.services.socket,
				_bufferedMessages: [],
				_reconnectTimeout: 60000
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SEND"),
				callback: "_subSend"
			},{
				channel : this.getChannel("GENERATE_NEW_SUBSCRIPTIONS"),
				callback: "_subGenerateNewSubscriptions"
			},{
				channel : this._buildChannel(this.loadingChannel, this.actions.LOAD_FINISHED),
				callback: "_subLoadFinished",
				options: {
					calls: 1
				}
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SOCKET_CONNECT',
				channel: this._buildChannel(this.taskChannel, this.actions.SOCKET_CONNECT)
			});
		},

		_connect: function() {

			console.log('STOMP: Connecting socket');

			var target = redmicConfig.getServiceUrl(this._socketTarget),
				url = target + "?access_token=" + Credentials.get("accessToken"),
				reconnectCbk = lang.hitch(this, this._reconnect);

			this.socket = new SockJS(url);
			this.socket.onclose = reconnectCbk;

			this.stompClient = Stomp.over(this.socket);
			this.stompClient.debug = function() {};

			this.stompClient.connect({},
				lang.hitch(this, this._postConnect),
				reconnectCbk);
		},

		_reconnect: function(msg) {

			console.log('STOMP: Connection lost ', msg);
			console.log('STOMP: Reconnecting in %s seconds', this._reconnectTimeout * 0.001);
			setTimeout(lang.hitch(this, this._connect), this._reconnectTimeout);
		},

		_postConnect: function(frame) {

			console.log('STOMP: Socket connected');

			if (this.stompClient.connected) {
				for (var i = 0; i < this._bufferedMessages.length; i++) {
					var bufferedMessage = this._bufferedMessages[i];
					this._send(bufferedMessage.target, bufferedMessage.message);
				}

				this._bufferedMessages = [];
			}

			this._emitEvt('SOCKET_CONNECT');
		},

		_subGenerateNewSubscriptions: function(req) {

			for (var type in req) {
				this._prepareSocketSubscription(req[type]);
			}
		},

		_prepareSocketSubscription: function(req) {

			var services = req.services,
				target = req.baseTarget,
				callback = req.callback;

			if (services) {
				for (var i = 0; i < services.length; i++) {
					this._subscribeToSocket(target + "/" + services[i], callback);
				}
			} else {
				this._subscribeToSocket(target, callback);
			}
		},

		_subscribeToSocket: function(target, callback) {

			this.stompClient.subscribe(target, callback);
		},

		_subLoadFinished: function() {

			this._connect();
		},

		_subSend: function(req) {

			var target = req.target,
				message = JSON.stringify(req.message || {});

			this._send(target, message);
		},

		_send: function(target, message) {

			if (this.stompClient && this.stompClient.connected) {
				this.stompClient.send(target, {}, message);
			} else {
				this._bufferedMessages.push({target: target, message: message});
			}
		}
	});
});
