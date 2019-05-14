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
					_onCloseResettingPassword: lang.hitch(this, this._onCloseResettingPassword),
					_onSubmitResettingPassword: lang.hitch(this, this._onSubmitResettingPassword)
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
			this._goBack();
		},

		_goBack: function() {

			window.location.href = '/';
		},

		_onSubmitResettingPassword: function(/*Event*/ evt) {
			// summary:
			//		Función que envia el formulario de recuperación de contraseña.
			//
			//	tags:
			//		callback private
			//

			var template = this.template,
				form = template.resettingPasswordFormNode;

			if (!form.validate()) {
				return;
			}

			var value = form.get("value");

			var envDfd = window.env;
			if (!envDfd) {
				return;
			}

			envDfd.then(lang.hitch(this, function(value, envData) {

				var target = redmicConfig.getServiceUrl(redmicConfig.services.resettingRequest, envData);

				request(target, {
					handleAs: "json",
					method: "POST",
					data: JSON.stringify(value),
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/javascript, application/json"
					}
				}).then(
					lang.hitch(this, this._handleResponse),
					lang.hitch(this, this._handleError));
			}, value));
		},

		_handleResponse: function(result) {
			//	summary:
			//		Función que maneja la respuesta del registro,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			if (result.success) {
				alertify.alert(this.i18n.success, this.i18n.resettingInfo, this._goBack);
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
			if (error.response && error.response.data) {
				error = error.response.data.error;
			}

			var msg = error.description;

			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {
					'exDescription': "_onSubmitResetting " + msg,
					'exFatal': false,
					'appName': 'API'
				}
			});

			this._emitEvt('COMMUNICATION', {
				type: "alert",
				level: "error",
				description: msg
			});
		}
	});
});
