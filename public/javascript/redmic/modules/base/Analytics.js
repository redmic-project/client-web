define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
], function(
	declare
	, lang
	, _Module
){
	// Constantes para trakear acciones
	// TODO: sacar a un fichero externo (Necesita ser global)
	window.TRACK = {
		'type': {
			'event': 'event',
			'page': 'pageview',
			'exception': 'exception'
		},
		'category': {
			'button': 'button',
			'check': 'checkBox',
			'layer': 'layer',
			'search': 'search'
		},
		'action': {
			'click': 'click',
			'dblClick': 'dblClick',
			'send': 'send'
		}
	};
	return declare(_Module, {
		//	summary:
		//		Módulo para trakear visualizaciones de páginas, eventos y otras acciones
		//	description:
		//		Escucha los canales de PageView... y envía a google analytics la información
		//		recibida además de otras posibilidades [ logs, alertas...].

		//	_cookiesAccepted: Boolean
		//		Flag que indica si se han aceptado las cookies.
		//	_pendingPageView: Object
		//		Guarda pageView pendiente para trakear cuando sea posible (cookies aceptadas)
		//	_pendingEventFired: Object
		//		Guarda eventFired pendiente para trakear cuando sea posible
		//	_pendingExceptionCaught: Object
		//		Guarda la excepción pendiente para trakear cuando sea posible

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					ACCEPT_COOKIES: "acceptCookies",
					COOKIES_STATE: "cookiesState"
				},
				// own actions
				actions: {
					ACCEPT_COOKIES: "acceptCookies",
					COOKIES_STATE: "cookiesState",
					COOKIES_ACCEPTED: "cookiesAccepted",
					PAGE_VIEW: "pageView",
					EVENT: "event",
					EXCEPTION: "event"
				},
				// mediator params
				ownChannel: "analytics",
				_cookiesAccepted: false,
				_pendingPageView: null,
				_pendingEventFired: null,
				_pendingExceptionCaught: null
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.credentialsChannel, this.actions.COOKIES_ACCEPTED),
				callback: "_subCookiesAccepted"
			},{
				channel : this.getChannel("TRACK"),
				callback: "_subTrack"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ACCEPT_COOKIES',
				channel: this._buildChannel(this.credentialsChannel, this.actions.ACCEPT_COOKIES),
				callback: "_pubCookies"
			},{
				event: 'COOKIES_STATE',
				channel: this._buildChannel(this.credentialsChannel, this.actions.COOKIES_STATE),
				callback: "_pubCookies"
			});
		},

		_subCookiesAccepted: function() {
			//	summary:
			//		Se ejecuta este callback cuando se recibe vía mediator
			//		que las cookies han sido aceptadas, por lo que se ejecutan
			//		los tracks pendientes
			//	tags:
			//		private

			this._cookiesAccepted = true;

			if (this._pendingPageView) {
				this._trackPageView(this._pendingPageView);
				delete this._pendingPageView;
			}

			if (this._pendingEventFired) {
				this._trackEventFired(this._pendingEventFired);
				delete this._pendingEventFired;
			}

			if (this._pendingExceptionCaught) {
				this._trackExceptionCaught(this._pendingExceptionCaught);
				delete this._pendingExceptionCaught;
			}
		},

		_subTrack: function(/*Object*/ request) {
			//	summary:
			//		Se ejecuta este callback cuando se recibe vía mediator
			//		la petición de un track, dependiendo el tipo se envía a
			//		la función que lo procesará
			//	tags:
			//		private

			if (!this._cookiesAccepted) {
				this._emitEvt('COOKIES_STATE');
			}

			if (request.type === TRACK.type.page) {
				this._pageView(request.info);
			}

			if (request.type === TRACK.type.event) {
				this._eventFired(request.info);
			}

			if (request.type === TRACK.type.exception) {
				this._exceptionCaught(request.info);
			}
		},

		_pageView: function(/*Object*/ pageInfo) {
			//	summary:
			//		Procesa la petición de trackear una página
			//	tags:
			//		private

			if (this._cookiesAccepted) {
				this._trackPageView(pageInfo);
			} else {
				this._pendingPageView = pageInfo;
			}
		},

		_eventFired: function(/*Object*/ eventInfo) {
			//	summary:
			//		Procesa la petición de trackear un evento
			//	tags:
			//		private

			if (!this._cookiesAccepted) {
				this._emitEvt('ACCEPT_COOKIES');
				this._pendingEventFired = eventInfo;
			} else {
				this._trackEventFired(eventInfo);
			}
		},

		_exceptionCaught: function(/*Object*/ exceptionInfo) {
			//	summary:
			//		Procesa la petición de trackear una excepción
			//	tags:
			//		private

			if (this._cookiesAccepted) {
				this._trackExceptionCaught(exceptionInfo);
			} else {
				this._pendingExceptionCaught = exceptionInfo;
			}
		},

		_pubCookies: function(channel) {

			this._publish(channel);
		},

		_gtagIsAvailable: function() {

			return typeof gtag !== 'undefined';
		},

		_trackPageView: function(/*Object*/ pageInfo) {
			//	summary:
			//		Permite trakear una página vista en google analytics
			//	tags:
			//		private
			//	pageInfo:
			//		Puede ser un string con la url de la página o un objeto con más información
			//		pj. page, title, version...

			if (this._gtagIsAvailable()) {
				gtag('event', 'page_view', {
					page_path: '/' + pageInfo
				});
			}
		},

		_trackEventFired: function(/*Object*/ eventInfo) {
			//	summary:
			//		Permite trakear un evento en google analytics
			//	tags:
			//		private
			//	eventInfo.category:
			//		Categoría del evento. ej: Button
			//	eventInfo.action
			//		Acción del evento. ej: Click
			//	eventInfo.label
			//		Etiqueta de la categoría. ej: Botón de login
			//	eventInfo.value
			//		Valor del evento
			//	** label y value son opcionales

			if (this._gtagIsAvailable()) {
				gtag('event', eventInfo.action, {
					event_category: eventInfo.category,
					event_label: eventInfo.label,
					value: eventInfo.value
				});
			}
		},

		_trackExceptionCaught: function(/*Object*/ exceptionInfo) {
			//	summary:
			//		Permite trakear un evento en google analytics
			//	tags:
			//		private
			//	exceptionInfo
			//		Objecto con información de la excepción. ej: exDescription, exFatal(boolen)...

			if (this._gtagIsAvailable()) {
				gtag('event', 'exception', {
					description: exceptionInfo.exDescription,
					fatal: !!exceptionInfo.exFatal
				});
			}
		}
	});
});
