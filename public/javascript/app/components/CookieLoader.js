define([
	'alertify/alertify.min'
	, 'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/i18n!app/nls/translation"
	, "redmic/base/Credentials"
], function(
	alertify
	, redmicConfig
	, declare
	, lang
	, i18n
	, Credentials
){
	return declare(null, {
		//	summary:
		//		Widget encargado de la carga y aviso de cookies.
		//	description:
		//		Centraliza toda la carga de cookies y permite guardarlas tras un tiempo.

		//	showTimeout: Integer
		//		Retraso para mostrar el aviso de cookies.
		//	hideTimeout: Integer
		//		Retraso para ocultar el aviso de cookies.
		//	warningText: String
		//		Contenido a mostrar en el aviso de cookies.


		constructor: function(args) {

			this.config = {
				showTimeout: 500,
				hideTimeout: 14500,
				warningText: "<span class='cookies fa fa-exclamation-circle'></span> " + i18n.cookiesWarning +
					"<a href='https://blog.redmic.es/?page_id=77' target='_blank'>" +
					i18n.here + "</a>."
			};

			lang.mixin(this, this.config, args);

			this._checkCookiesAuthorization();
		},

		_checkCookiesAuthorization: function() {
			//	summary:
			//		Comprueba los permisos de cookies y se encarga de avisar y cargarlas.
			//	tags:
			//		private

			if (!Credentials.has("cookiesAccepted")) {
				this._onCookiesAcceptedHandler = Credentials.on("changed:cookiesAccepted", lang.hitch(this,
					this._loadCookies));

				this._showWarning();
			} else {
				this._loadCookies();
			}
		},

		_showWarning: function() {
			//	summary:
			//		Muestra la alerta de la carga de cookies.
			//	tags:
			//		private

			this._showTimeoutHandler = setTimeout(lang.hitch(this, function() {
				// Si pasa el tiempo de la alerta o le hacemos click, aceptamos
				// TODO pasar a notification
				this._cookiesNotificationHandler = alertify.notify(this.warningText, "message", this.hideTimeout / 1000,
					lang.hitch(this, this._acceptCookies));
			}), this.showTimeout);
		},

		_acceptCookies: function() {
			//	summary:
			//		Se encarga de controlar la aceptación del uso de cookies.
			//	tags:
			//		private

			Credentials.set("cookiesAccepted", "true");
		},

		_loadCookies: function() {
			//	summary:
			//		Carga las cookies suponiendo que ya tenemos permiso.
			//	tags:
			//		private

			clearTimeout(this._showTimeoutHandler);
			this._onCookiesAcceptedHandler && this._onCookiesAcceptedHandler.remove();
			this._cookiesNotificationHandler && this._cookiesNotificationHandler.dismiss();

			if (window.location.hostname.indexOf("redmic.es") > -1) {
				this._googleAnalytics();
			}
		},

		_googleAnalytics: function() {
			//	summary:
			//		Carga los scripts de Google Analytics.
			//	tags:
			//		private

			(function(i,s,o,g,r,a,m) {
				i.GoogleAnalyticsObject = r;

				i[r] = i[r] || function() {
					(i[r].q = i[r].q || []).push(arguments);
				};
				i[r].l = 1 * new Date();
				a = s.createElement(o);
				m = s.getElementsByTagName(o)[0];
				a.async = 1;
				a.src = g;
				m.parentNode.insertBefore(a,m);
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			ga('create', redmicConfig.googleAnalyticsId, 'auto');
			ga('send', 'pageview');
		}
	});
});
