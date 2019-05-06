define([
	'alertify/alertify.min'
	, "app/user/views/_ExternalUserBaseView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/request"
	, "dojo/text!./templates/ConfirmResetting.html"
], function(
	alertify
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, request
	, template
){

	return declare(_ExternalUserBaseView, {
		//	summary:
		//		Vista de confimación de resetting password
		//
		//	description:
		//		Permite resetear la contraseña a partir de un enlace enviado al correo electrónico
		//		asociado a la cuenta.

		constructor: function(args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_onSubmitResetting: lang.hitch(this, this._onSubmitResetting),
					_onCloseResetting: lang.hitch(this, this._onCloseResetting),
					_confirmValidator: lang.hitch(this, this._confirmValidator)
				},
				ownChannel: "confirmResetting"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			var token = this.queryParameters ? this.queryParameters.token : null;

			if (token) {
				this.token = token;
			} else {
				this._onGetTokenError();
			}
		},

		_onSubmitResetting: function(/*Event*/ evt) {
			//	Summary:
			//		Llamado cuando se pulsa el botón para enviar el formulario y resetear
			//		la contraseña
			//
			//	tags:
			//		private callback
			//

			var template = this.template,
				form = template.resettingFormNode;

			if (!form.validate()) {
				return;
			}

			var value = form.get("value"),
				data = {
					password: value.password,
					token: this.token
				};

			var envDfd = window.env;
			if (!envDfd) {
				return;
			}

			envDfd.then(lang.hitch(this, function(data, envData) {

				var target = redmicConfig.getServiceUrl(redmicConfig.services.resettingSetPassword, envData);

				request(target, {
					handleAs: "json",
					method: "POST",
					data: JSON.stringify(data),
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/javascript, application/json"
					}
				}).then(
					lang.hitch(this, this._handleResponse),
					lang.hitch(this, this._handleError));
			}, data));
		},

		_handleResponse: function(result) {
			//	summary:
			//		Función que maneja la respuesta del recovery,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			if (result.success) {
				alertify.alert(this.i18n.success, this.i18n.successResetting, this._goBack);
			} else {
				this._handleError(result.error);
			}
		},

		_handleError: function(error) {
			//	summary:
			//		Función que maneja el posible error de la respuesta de recover password
			//
			//	tags:
			//		callback private

			this._notifyError(error);
			this._goBack();
		},

		_notifyError: function(error) {
			//	summary:
			//		Función que maneja el error fuera del ámbito del template (ámbito de la vista)
			//
			//	tags:
			//		callback private

			// TODO: cambiar cuando esten unificados los errores de la api
			if (Array.isArray(error)) {
				error = error[0];
			}

			if (error.response && error.response.data) {
				error = error.response.data.error;
			}

			var msg = error.description;

			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {
					'exDescription': "_onSubmitConfirmResetting " + msg,
					'exFatal': false,
					'appName': 'API'
				}
			});

			this._emitEvt('COMMUNICATION', {
				type: "alert",
				level: "error",
				description: msg
			});
		},

		_onCloseResetting: function(/**/ evt) {
			// summary:
			//		Llamado cuando se pulsa el botón para cancelar el reseteo la password.
			//		Llama a limpiar el formulario.
			//
			//	tags:
			//		private callback

			this._goBack();
		},

		_goBack: function() {

			window.location.href = '/';
		},

		_onGetTokenError: function() {

			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {
					'exDescription': "_onGetTokenError",
					'exFatal': false,
					'appName': 'WEB'
				}
			});

			window.location.href = '/404';
		},

		_confirmValidator: function() {
			//	summary:
			//		Función que valida el campo confirm del formulario.
			//		Es válido cuando el campo password coincide con el campo confirm

			return this.template.password.get("value") === this.template.confirm.get("value");
		}
	});
});
