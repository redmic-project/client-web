define([
	"app/user/views/_ExternalUserBaseView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "dojo/request"
	, "dojo/aspect"
	, "dojo/text!./templates/ConfirmResetting.html"
], function(
	_ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, domClass
	, request
	, aspect
	, template
){
	return declare(_ExternalUserBaseView, {
		//	summary:
		//		Vista de confimación de resetting password
		//
		//	description:
		//		Permite resetear la contraseña a partir de un enlace enviado al correo electrónico
		//		asociado a la cuenta.

		constructor: function (args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					token: this.param,
					_onSubmitResetting: lang.hitch(this.template, this._onSubmitResetting, this),
					_onCloseResetting: this._onCloseResetting,
					_confirmValidator: lang.hitch(this, this._confirmValidator),
					_handleResponse: this._handleResponse,
					_handleError: this._handleError,
					_resetForm: this._resetForm
				},
				ownChannel: "posResetting"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			// Si no llega token como parámetro -> 404
			if (this.query.where && this.query.where.token) {
				this.token = this.query.where.token;
			} else {
				window.location.href = "/404";
			}

			aspect.after(this.template, "_handleError", lang.hitch(this, this._notifyError));
		},

		_onSubmitResetting: function(/*Obj*/ module, /*Event*/ evt) {
			//	Summary:
			//		Llamado cuando se pulsa el botón para enviar el formulario y resetear
			//		la contraseña
			//
			//	tags:
			//		private callback
			//

			if (this.resettingFormNode.validate() && (values = this.resettingFormNode.get("value"))) {
				var data = {
					password: values.password,
					token: module.token
				};

				request(redmicConfig.services.resettingSetPassword, {
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
			}
		},

		_handleResponse: function(result){
			//	summary:
			//		Función que maneja la respuesta del recovery,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			if(result.success) {
				domClass.toggle(this.resettingManagerNode, "hidden");
				domClass.toggle(this.successNode, "hidden");
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

			this._resetForm();
		},

		_notifyError: function(method, error) {
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
				info: {'exDescription': "_onSubmitRegister " + msg,'exFatal':false, 'appName':'API'}
			});

			this._emitEvt('COMMUNICATION', {type: "alert", level: "error", description: msg});
		},

		_onCloseResetting: function(/**/ evt){
			// summary:
			//		Llamado cuando se pulsa el botón para cancelar el reseteo la password.
			//		Llama a limpiar el formulario.
			//
			//	tags:
			//		private callback

			this._resetForm();
		},

		_resetForm: function() {
			// summary:
			//		Limpia el formulario.
			//
			//	tags:
			//		private callback

			this.password.set("value", null);
			this.confirm.set("value", null);
		},

		_confirmValidator: function(){
			//	summary:
			//		Función que valida el campo confirm del formulario.
			//		Es válido cuando el campo password coincide con el campo confirm

			if (this.template.password.get("value") === this.template.confirm.get("value")) {
				return true;
			}

			return false;
		}
	});
});
