define([
	'dojo/_base/declare'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './_Page'
], function (
	declare
	, Config
	, Utils
	, _Page
) {

	var url = 'login',
		urlAfterLogin = Config.url.home,
		userLoginButtonSelector = 'span[widgetid="dijit_form_Button_0"]',
		guestLoginButtonSelector = 'div.boxLabel a[href="/home"]',
		usernameInputSelector = 'input[name="email"]',
		passwordInputSelector = 'input[name="password"]',

		fillUserCredentialsForm = function(username, password) {

			return function() {

				return this.parent
					.then(Utils.setInputValue(usernameInputSelector, username))
					.then(Utils.setInputValue(passwordInputSelector, password));
			};
		},

		loginUser = function(username, password) {

			return function() {

				return this.parent
					.then(fillUserCredentialsForm(username, password))
					.then(Utils.clickElement(userLoginButtonSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.checkUrl(urlAfterLogin));
			};
		};

	return declare(_Page, {

		constructor: function(args) {

			this.remote
				.setFindTimeout(Config.timeout.findElement)
				.maximizeWindow();
		},

		setCredentials: function(username, password) {

			return function() {

				return this.parent
					.then(fillUserCredentialsForm(username, password));
			};
		},

		clickLogin: function() {

			return function() {

				return this.parent
					.findByCssSelector(userLoginButtonSelector)
						.click();
			};
		},

		goToUrl: function() {

			return this.remote
				.get(url)
				.then(Utils.checkLoadingIsGone());
		},

		login: function() {

			var ctx;

			if (Config.credentials.userRole === 'guest') {
				ctx = this.loginAsGuestUser();
			} else {
				ctx = this.loginAsRegisteredUser();
			}

			return ctx.then(Utils.checkLoadingIsGone());

		},

		loginAsGuestUser: function() {

			return this
				.goToUrl()
				.then(Utils.clickElementAndCheckUrl(guestLoginButtonSelector, urlAfterLogin));
		},

		loginAsRegisteredUser: function() {

			var user = Config.credentials,
				username = user.userName,
				password = user.userPassword;

			return this
				.goToUrl()
				.then(loginUser(username, password));
		}
	});
});
