define([
	'alertify/alertify.min'
	, "app/user/views/_ExternalUserBaseView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/request"
	, "dojo/text!./templates/Resetting.html"
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
		// summary:
		// 	Vista de register
		//
		// description:
		// 	Permite registrarse en la aplicación

		constructor: function (args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_onCloseResettingPassword: this._onCloseResettingPassword,
					_onSubmitResettingPassword: lang.hitch(this.template,
						this._onSubmitResettingPassword, this),
					_handleResponse: this._handleResponse,
					_handleError: this._handleError
				},
				ownChannel: "resetting"
			};

			lang.mixin(this, this.config, args);
		},

		_putMetaTags: function() {
			//	summary:
			//		Manda a publicar la información necesaria para que se generen las meta-tags
			//		de la vista actual. Debe ejecutarse después del show de la vista, ya que este
			//		indica mediante el flag "metaTags" si debe o no generarse.
			//		*** Función que sobreescribe a la de _View para enviar más datos  ***
			//	tags:
			//		private

			if (this.metaTags) {
				this._emitEvt('PUT_META_TAGS', {
					view: this.ownChannel,
					"robots": "noindex, nofollow"
				});
			}
		},

		_onCloseResettingPassword: function(/*Event*/ evt) {
			// summary:
			//		Función que cancela la vista de resetear contraseña
			//
			//	tags:
			//		callback private
			//
			window.location.href = "/";
		},

		_onSubmitResettingPassword: function(/*Obj*/ module, /*Event*/ evt){
			// summary:
			//		Función que envia el formulario de recuperación de contraseña.
			//
			//	tags:
			//		callback private
			//

			if (this.resettingPasswordFormNode.validate() && (values = this.resettingPasswordFormNode.get("value"))){
				request(redmicConfig.services.resettingRequest, {
					handleAs: "json",
					method: "POST",
					data: JSON.stringify(values),
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/javascript, application/json"
					}
				}).then(
					lang.hitch(module, this._handleResponse),
					lang.hitch(module, this._handleError));
			}
		},

		_handleResponse: function(result){
			//	summary:
			//		Función que maneja la respuesta del registro,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			if (result.success) {
				alertify.alert(this.i18n.success, this.i18n.resettingInfo, function(){
					window.location.href = "/";
				});
			} else {
				this._handleError(result.error);
			}
		},

		_handleError: function(error) {
			//	summary:
			//		Función que maneja el posible error de la respuesta de registro
			//
			//	tags:
			//		callback private

			// TODO: cambiar cuando esten unificados los errores de la api
			if (error.response && error.response.data) {
				error = error.response.data.error;
			}

			var msg = error.description;
			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {'exDescription': "_onSubmitResetting "+msg,'exFatal':false, 'appName':'API'}
			});

			this._emitEvt('COMMUNICATION', {type: "alert", level: "error", description: msg});
		}
	});
});
