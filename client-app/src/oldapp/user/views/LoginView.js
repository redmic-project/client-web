define([
	'alertify'
	, 'app/user/views/_ExternalUserBaseView'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/text!./templates/Login.html'
	, 'src/util/Credentials'
], function(
	alertify
	, _ExternalUserBaseView
	, declare
	, lang
	, template
	, Credentials
) {

	return declare(_ExternalUserBaseView, {
		//	Summary:
		//		Vista de login, permite identificarse para entrar a la aplicación.

		constructor: function(args) {

			this.config = {
				ownChannel: 'login',
				actions: {
					USER_LOGIN: 'userLogin',
					USER_LOGGED_IN: 'userLoggedIn',
					USER_LOGIN_ERROR: 'userLoginError'
				},
				templateProps: {
					templateString: template,
					i18n: this.i18n,
					_onSignIn: lang.partial(this._onSignIn, this),
					_onGuestAccess: lang.hitch(this, this._onGuestAccess),
					_onKeyPress: lang.partial(this._onKeyPress, this)
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.authChannel, 'USER_LOGGED_IN'),
				callback: '_subUserLoggedIn'
			},{
				channel: this._buildChannel(this.authChannel, 'USER_LOGIN_ERROR'),
				callback: '_subUserLoginError'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			// Si hemos entrado anteriormente, pone el correo usado por última vez
			if (!Credentials.userIsGuest('userRole')) {
				this.template.emailInputForm.set('value', Credentials.get('userEmail'));
			}
			// Si hemos activado la cuenta anteriormente, informa al usuario
			if (Credentials.has('accountActivated')) {
				alertify.success(this.i18n.accountActivated, '');
				Credentials.remove('accountActivated');
			}
		},

		_startLoading: function() {

			this._emitEvt('LOADING');
		},

		_endLoading: function() {

			this._emitEvt('LOADED');
		},

		_onSignIn: function(self) {

			if (this.loginFormNode.validate()) {
				const values = this.loginFormNode.get('value');
				this.password.set('value', '');
				self._requestUserLogin(values);
			} else {
				self._emitEvt('TRACK', {
					event: 'login_invalid'
				});
			}
		},

		_requestUserLogin: function(data) {

			this._startLoading();

			this._publish(this._buildChannel(this.authChannel, 'USER_LOGIN'), {
				user: data.email,
				pass: data.password
			});
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
			if (evt.keyCode !== 13) {
				return;
			}

			lang.hitch(this, self._onSignIn)(self);
		},

		_subUserLoggedIn: function(_res) {

			this._startLoading();

			this._emitEvt('TRACK', {
				event: 'login',
				method: 'email'
			});
		},

		_subUserLoginError: function(res) {

			this._emitEvt('TRACK', {
				event: 'login_error',
				status: res.status,
				error: res.error
			});
		},

		_beforeHide: function() {

			this._endLoading();
		}
	});
});
