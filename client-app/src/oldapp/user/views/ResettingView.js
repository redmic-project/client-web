define([
	'alertify'
	, "app/user/views/_ExternalUserBaseView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/text!./templates/Resetting.html"
	, 'src/component/base/_Store'
], function(
	alertify
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, template
	, _Store
) {

	return declare([_ExternalUserBaseView, _Store], {
		//	summary:
		//		Vista que permite solicitar el reseteo de la contraseña de usuario

		constructor: function(args) {

			this.config = {
				ownChannel: "resetting",
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_onCloseResettingPassword: lang.hitch(this, this._onCloseResettingPassword),
					_onSubmitResettingPassword: lang.hitch(this, this._onSubmitResettingPassword)
				},
				target: redmicConfig.services.resettingRequest
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

			globalThis.location.href = '/';
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

			this._emitEvt('REQUEST', {
				target: this.target,
				method: 'POST',
				query: value
			});
		},

		_dataAvailable: function(res, resWrapper) {

			this._handleResponse(res.data);
		},

		_errorAvailable: function(error, status, resWrapper) {

			this._handleError(resWrapper.res.data);
		},

		_handleResponse: function(result) {
			//	summary:
			//		Función que maneja la respuesta del registro,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			alertify.alert(this.i18n.success, this.i18n.resettingInfo, this._goBack);
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
