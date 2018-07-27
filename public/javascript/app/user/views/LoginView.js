define([
	'alertify/alertify.min'
	, "app/user/views/_ExternalUserBaseView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/request"
	, "dojo/aspect"
	, "dojo/text!./templates/Login.html"
	, "redmic/base/Credentials"
], function(
	alertify
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, request
	, aspect
	, template
	, Credentials
){
	return declare(_ExternalUserBaseView, {
		//	Summary:
		//		Vista de login
		//
		//	Description:
		//		Permite identificarse para entrar a la aplicación.


		constructor: function (args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_onClickGuest: this._onClickGuest,
					_onSignIn: this._onSignIn,
					_getAccessToken: this._getAccessToken,
					_onGuestAccess: lang.hitch(this, this._onGuestAccess),
					_onKeyPress: this._onKeyPress,
					_loginError: this._loginError
				},
				ownChannel: "login"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			aspect.before(this.template, "_onSignIn", lang.hitch(this, this._trackLoginButton, 'login'));
			aspect.before(this.template, "_getAccessToken", lang.hitch(this, this._emitEvt, 'LOADING'));
			aspect.before(this.template, "_loginError", lang.hitch(this, this._emitEvt, 'LOADED'));

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

		_onSignIn: function(/*Event*/ evt) {
			//	Summary:
			//		Llamado cuando se pulsa el botón para acceder a la plataforma.
			//      Se realiza una validación del formulario y luego se realiza
			//		el envío de este.
			//		*** Se ejecuta en el ámbito del template
			//
			//	tags:
			//		private callback
			//

			if (this.loginFormNode.validate() && (values = this.loginFormNode.get("value"))) {

				this.password.set("value", "");
				this._getAccessToken(values).then(function(result) {
					Credentials.set("accessToken", result.access_token);
				}, lang.hitch(this, this._loginError));
			}
		},

		_onGuestAccess: function(evt) {

			this._trackLoginButton('guest');
		},

		_loginError: function(err) {

			var error = "Error",
				res = err.response;

			if (res && res.data && res.data.error_description) {
				error = res.data.error_description;
			} else if (err.message) {
				error = err.message;
			}

			alertify.error(error);
		},

		_onKeyPress: function(/*Event*/ evt) {
			//	Summary:
			//		Llamado cuando se pulsa una tecla estando en los inputs.
			//
			//	tags:
			//		private callback
			//

			// Sólo escuchamos las pulsaciones del enter
			if (evt.keyCode === 13) {
				this._onSignIn();
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

			var url = redmicConfig.services.getToken,
				clientId = redmicConfig.oauthClientId,
				bodyData = 'clientid=' + clientId + '&username=' + values.email + '&password=' + values.password;

			return request(url, {
				method: 'POST',
				handleAs: 'json',
				data: bodyData
			});
		}
	});
});
