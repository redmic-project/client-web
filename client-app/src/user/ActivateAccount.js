define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/request'
	, 'src/util/CookieLoader'
	, 'src/util/RedmicLocalStorage'
], function(
	redmicConfig
	, declare
	, lang
	, request
	, CookieLoader
	, RedmicLocalStorage
) {

	// TODO falta aquí solamente por quitar 'dojo/request', el resto se han centralizado en RestManagerImpl. Se podrá
	// quitar cuando esto se convierta en una View y se gestione igual que otras vistas de 'src/user/', en lugar de
	// gestionar por ruta separada y capturar el valor del token desde plantilla pug

	return declare(null, {

		constructor: function(args) {

			lang.mixin(this, args);

			var data = {
				token: this.token
			};

			new CookieLoader({
				omitWarning: true
			});

			this._activateAccount(data);
		},

		_activateAccount: function(data) {

			var target = redmicConfig.getServiceUrl(redmicConfig.services.activateAccount);

			request(target, {
				handleAs: 'json',
				method: 'POST',
				data: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/javascript, application/json'
				}
			}).then(
				lang.hitch(this, this._handleResponse),
				lang.hitch(this, this._handleError));
		},

		_handleResponse: function(result) {

			if (result.success) {
				RedmicLocalStorage.setItem('accountActivated', 'true');
				this._goBack();
			} else {
				this._goError();
			}
		},

		_handleError: function(error) {

			this._goError();
		},

		_goBack: function() {

			globalThis.location.href = '/';
		},

		_goError: function() {

			globalThis.location.href = '/404';
		}
	});
});
