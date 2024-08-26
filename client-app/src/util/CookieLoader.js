define([
	'alertify/alertify.min'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/i18n!app/nls/translation'
	, 'src/util/Credentials'
], function(
	alertify
	, redmicConfig
	, declare
	, lang
	, i18n
	, Credentials
) {

	return declare(null, {
		//	summary:
		//		Widget encargado de la carga y aviso de cookies.
		//	description:
		//		Centraliza toda la carga de cookies y permite guardarlas tras un tiempo.

		//	showTimeout: Integer
		//		Retraso para mostrar el aviso de cookies.
		//	hideTimeout: Integer
		//		Retraso para ocultar el aviso de cookies.
		//	omitWarning: Boolean
		//		Procede a cargar las cookies sin preguntar, para casos donde es indispensable.
		//	warningText: String
		//		Contenido a mostrar en el aviso de cookies.

		constructor: function(args) {

			this.config = {
				showTimeout: 500,
				hideTimeout: 14500,
				omitWarning: false,
				warningText: '<span class="cookies fa fa-exclamation-circle"></span> ' + i18n.cookiesWarning +
					'<a href="/terms-and-conditions" d-state-url="true">' +
					i18n.here + '</a>.'
			};

			lang.mixin(this, this.config, args);

			this._checkCookiesAuthorization();
		},

		_checkCookiesAuthorization: function() {
			//	summary:
			//		Comprueba los permisos de cookies y se encarga de avisar y cargarlas.
			//	tags:
			//		private

			if (this.omitWarning || Credentials.has('cookiesAccepted')) {
				this._loadCookies();
			} else {
				this._onCookiesAcceptedHandler = Credentials.on('changed:cookiesAccepted', lang.hitch(this,
					this._loadCookies));

				this._showWarning();
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
				this._cookiesNotificationHandler = alertify.notify(this.warningText, 'message', this.hideTimeout / 1000,
					lang.hitch(this, this._acceptCookies));
			}), this.showTimeout);
		},

		_acceptCookies: function() {
			//	summary:
			//		Se encarga de controlar la aceptación del uso de cookies.
			//	tags:
			//		private

			Credentials.set('cookiesAccepted', 'true');
		},

		_loadCookies: function() {
			//	summary:
			//		Carga las cookies suponiendo que ya tenemos permiso.
			//	tags:
			//		private

			clearTimeout(this._showTimeoutHandler);
			this._onCookiesAcceptedHandler && this._onCookiesAcceptedHandler.remove();
			this._cookiesNotificationHandler && this._cookiesNotificationHandler.dismiss();

			var isProduction = (/true/i).test(redmicConfig.getEnvVariableValue('envProduction'));
			if (isProduction) {
				this._googleAnalytics();
			}
		},

		_googleAnalytics: function() {
			//	summary:
			//		Carga los scripts de Google Analytics.
			//	tags:
			//		private

			var script = document.createElement('script'),
				gtagId = redmicConfig.googleAnalyticsId;

			script.async = true;
			script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gtagId;

			document.head.appendChild(script);

			window.dataLayer = [];

			window.gtag = function() {

				dataLayer.push(arguments);
			};

			gtag('js', new Date());
			gtag('config', gtagId);
		}
	});
});
