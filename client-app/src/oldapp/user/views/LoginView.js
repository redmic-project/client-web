define([
	'alertify'
	, "app/user/views/_ExternalUserBaseView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/text!./templates/Login.html"
	, "src/util/Credentials"
	, 'src/component/base/_Store'
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
				templateProps: {
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
			if (!Credentials.userIsGuest("userRole")) {
				this.template.emailInputForm.set("value", Credentials.get("userEmail"));
			}
			// Si hemos activado la cuenta anteriormente, informa al usuario
			if (Credentials.has("accountActivated")) {
				alertify.success(this.i18n.accountActivated, "");
				Credentials.remove("accountActivated");
			}
		},

		_startLoading: function() {

			this._emitEvt('LOADING');
		},

		_endLoading: function() {

			this._emitEvt('LOADED');
		},

		_onSignIn: function(self) {
			//	Summary:
			//		Llamado cuando se pulsa el botón para acceder a la plataforma.
			//		Se realiza una validación del formulario y luego se realiza
			//		el envío de este.
			//		*** Se ejecuta en el ámbito del template
			//
			//	tags:
			//		private callback
			//

			if (this.loginFormNode.validate()) {
				var values = this.loginFormNode.get('value');
				if (!values) {
					return;
				}

				self._startLoading();
				this.password.set('value', '');
				self._getAccessToken(values);
			} else {
				self._emitEvt('TRACK', {
					event: 'login_invalid'
				});
			}
		},

		_onGuestAccess: function() {

			this._startLoading();

			this._emitEvt('TRACK', {
				event: 'login_guest'
			});
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
				lang.hitch(this, self._onSignIn)(self);
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

			var data = {
				username: values.email,
				password: values.password
			};

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

		_dataAvailable: function(res) {

			this._emitEvt('TRACK', {
				event: 'login'
			});

			this._startLoading();

			var accessToken = res.data.access_token;
			Credentials.set('accessToken', accessToken);
		},

		_errorAvailable: function(error, status) {

			this._emitEvt('TRACK', {
				event: 'login_error',
				status: status,
				error: error
			});
		},

		_beforeHide: function() {

			this._endLoading();
		}
	});
});
