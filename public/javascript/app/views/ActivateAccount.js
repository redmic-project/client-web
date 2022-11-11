define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/request'
	, 'redmic/base/RedmicLocalStorage'
], function(
	redmicConfig
	, declare
	, lang
	, request
	, RedmicLocalStorage
) {

	return declare(null, {

		constructor: function(args) {

			lang.mixin(this, args);

			var data = {
				token: this.token
			};

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

			window.location = '/';
		},

		_goError: function() {

			window.location = '/404';
		}
	});
});
