define([
	'alertify/alertify.min'
	, "app/user/views/_ExternalUserBaseView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/text!./templates/Login.html"
	, "redmic/base/Credentials"
	, 'redmic/modules/base/_Store'
], function(
	alertify
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, template
	, Credentials
	, _Store
) {

	return declare([_ExternalUserBaseView, _Store], {
		//	Summary:
		//		Vista de login
		//
		//	Description:
		//		Permite identificarse para entrar a la aplicación.


		constructor: function (args) {

			this.config = {
				ownChannel: "login",
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_onSignIn: lang.partial(this._onSignIn, this),
					_onGuestAccess: lang.hitch(this, this._onGuestAccess),
					_onKeyPress: lang.partial(this._onKeyPress, this)
				},
				target: redmicConfig.services.getToken
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			// Si hemos entrado anteriormente, pone el correo usado por última vez
			if (Credentials.get("userRole") !== "ROLE_GUEST") {
				this.template.emailInputForm.set("value", Credentials.get("userEmail"));
			}
			// Si hemos activado la cuenta anteriormente, informa al usuario
			if (Credentials.has("accountActivated")) {
				alertify.success(this.i18n.accountActivated, "");
				Credentials.remove("accountActivated");
			}
		},

		_trackLoginButton: function(label) {
			//	Summary:
			//		Manda al módulo analytics la información para trackear el botón
			//
			//	tags:
			//		private callback
			//

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: label
				}
			});
		},

		_onSignIn: function(self, /*Event*/ evt) {
			//	Summary:
			//		Llamado cuando se pulsa el botón para acceder a la plataforma.
			//      Se realiza una validación del formulario y luego se realiza
			//		el envío de este.
			//		*** Se ejecuta en el ámbito del template
			//
			//	tags:
			//		private callback
			//

			self._trackLoginButton('login');

			if (this.loginFormNode.validate() && (values = this.loginFormNode.get("value"))) {
				this.password.set("value", "");
				self._getAccessToken(values);
			}
		},

		_onGuestAccess: function(evt) {

			this._trackLoginButton('guest');
		},

		_onKeyPress: function(self, /*Event*/ evt) {
			//	Summary:
			//		Llamado cuando se pulsa una tecla estando en los inputs.
			//
			//	tags:
			//		private callback
			//

			// Sólo escuchamos las pulsaciones del enter
			if (evt.keyCode === 13) {
				self._onSignIn();
			}
		},

		_getAccessToken: function(/*obj*/ values) {
			// summary:
			//		Función que se realiza un request con los valores que le pasas
			//		para obtener el token.
			//		*** Se ejecuta en el ámbito del template
			//
			//	tags:
			//		values private: credenciales para obtener el token
			//

			var clientId = redmicConfig.oauthClientId,
				username = values.email,
				password = values.password,
				data = 'clientid=' + clientId + '&username=' + username + '&password=' + password;

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target,
				options: {
					data: data,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			});
		},

		_dataAvailable: function(res, resWrapper) {

			var accessToken = res.data.access_token;
			Credentials.set('accessToken', accessToken);
		},

		_errorAvailable: function(error, status, resWrapper) {

			var res = resWrapper.res,
				errorRes = JSON.parse(res.text),
				errorMsg;

			if (errorRes && errorRes.error_description) {
				errorMsg = errorRes.error_description;
			} else {
				errorMsg = error;
			}

			alertify.error(errorMsg);
		}
	});
});
