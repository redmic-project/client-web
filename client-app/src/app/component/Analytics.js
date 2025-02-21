define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
], function(
	declare
	, lang
	, _Module
) {

	return declare(_Module, {
		//	summary:
		//		Módulo para hacer seguimiento de las acciones de los usuarios con el fin de extraer métricas.

		//	_cookiesAccepted: Boolean
		//		Flag que indica si se han aceptado las cookies.
		//	_pendingEvents: Array
		//		Guarda eventos pendientes de envío (para cuando las cookies sean aceptadas)

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					ACCEPT_COOKIES: 'acceptCookies',
					COOKIES_STATE: 'cookiesState'
				},
				// own actions
				actions: {
					ACCEPT_COOKIES: 'acceptCookies',
					COOKIES_STATE: 'cookiesState',
					COOKIES_ACCEPTED: 'cookiesAccepted'
				},
				// mediator params
				ownChannel: 'analytics',
				_cookiesAccepted: false,
				_pendingEvents: []
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.credentialsChannel, 'COOKIES_ACCEPTED'),
				callback: '_subCookiesAccepted'
			},{
				channel : this.getChannel('TRACK'),
				callback: '_subTrack'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ACCEPT_COOKIES',
				channel: this._buildChannel(this.credentialsChannel, 'ACCEPT_COOKIES')
			},{
				event: 'COOKIES_STATE',
				channel: this._buildChannel(this.credentialsChannel, 'COOKIES_STATE')
			});
		},

		_subCookiesAccepted: function() {

			this._cookiesAccepted = true;

			this._pendingEvents.forEach(lang.hitch(this, this._trackEvent));

			this._pendingEvents = [];
		},

		_subTrack: function(/*Object*/ req) {

			if (!this._cookiesAccepted) {
				this._pendingEvents.push(req);
				this._emitEvt('COOKIES_STATE');
				return;
			}

			this._trackEvent(req);
		},

		_trackEvent: function(/*Object*/ eventInfo) {
			//	summary:
			//		Permite registrar un evento en Google Tag Manager.
			//	tags:
			//		private
			//	eventInfo:
			//		Objeto con la información del evento a registrar.

			if (!this._gtmIsAvailable()) {
				console.warn('Google Tag Manager was not available when tried to track event', event);
				return;
			}

			this._pushEvent(this._getFinalEvent(eventInfo));
		},

		_gtmIsAvailable: function() {

			return typeof globalThis.dataLayer !== 'undefined';
		},

		_pushEvent: function(/*Object*/ event) {
			//	summary:
			//		Hace la publicación final del evento en Google Tag Manager.
			//	tags:
			//		private

			globalThis.dataLayer.push(event);
		},

		_getFinalEvent: function(/*Object*/ eventInfo) {
			//	summary:
			//		Permite transformar el objeto que define al evento antes de su envío a Google Tag Manager.
			//	tags:
			//		private

			return eventInfo;
		}
	});
});
