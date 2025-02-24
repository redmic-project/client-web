define([
	'alertify'
	, "app/user/views/_ExternalUserBaseView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/text!./templates/ConfirmResetting.html"
	, 'src/component/base/_ListenQueryParams'
	, 'src/component/base/_Store'
], function(
	alertify
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, template
	, _ListenQueryParams
	, _Store
) {

	return declare([_ExternalUserBaseView, _Store, _ListenQueryParams], {
		//	summary:
		//		Vista que permite resetear la contraseña de un usuario, a partir de un enlace enviado al correo
		//		electrónico asociado a dicha cuenta.

		constructor: function(args) {

			this.config = {
				ownChannel: "confirmResetting",
				templateProps: {
					templateString: template,
					i18n: this.i18n,
					_onSubmitResetting: lang.hitch(this, this._onSubmitResetting),
					_onCloseResetting: lang.hitch(this, this._onCloseResetting),
					_confirmValidator: lang.hitch(this, this._confirmValidator)
				},
				target: redmicConfig.services.resettingSetPassword
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_QUERY_PARAMS');
		},

		_gotQueryParams: function(queryParams) {

			var token = queryParams.token;

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

			this._emitEvt('REQUEST', {
				target: this.target,
				method: 'POST',
				query: data
			});
		},

		_dataAvailable: function(res, _resWrapper) {

			this._emitEvt('TRACK', {
				event: 'password_confirm'
			});

			this._handleResponse(res.data);
		},

		_errorAvailable: function(error, status, resWrapper) {

			this._emitEvt('TRACK', {
				event: 'password_confirm_error',
				status: status
			});

			this._handleError(resWrapper.res.data);
		},

		_handleResponse: function(result) {
			//	summary:
			//		Función que maneja la respuesta del recovery,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			alertify.alert(this.i18n.success, this.i18n.successResetting, this._goBack);
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

			var msg = error.description;

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

			globalThis.location.href = '/';
		},

		_onGetTokenError: function() {

			this._emitEvt('TRACK', {
				event: 'get_token_error'
			});

			globalThis.location.href = '/404';
		},

		_confirmValidator: function() {
			//	summary:
			//		Función que valida el campo confirm del formulario.
			//		Es válido cuando el campo password coincide con el campo confirm

			return this.template.password.get("value") === this.template.confirm.get("value");
		}
	});
});
