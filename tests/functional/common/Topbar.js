define([
	'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/Login'
	, 'tests/support/Utils'
], function (
	lang
	, Config
	, LoginPage
	, Utils
) {
	var indexPage,

		loginPageUrl = Config.url.login,
		registerPageUrl = Config.url.register,
		infoPageUrl = Config.url.innerRedmicInfo,
		homePageUrl = Config.url.home,

		_guestAreaSelector = 'div.manager > div.userAreaGuest > ',
		loginLinkSelector = _guestAreaSelector + 'a[href="' + loginPageUrl + '"]',
		registerLinkSelector = _guestAreaSelector + 'a[href="' + registerPageUrl + '"]',
		infoLinkSelector = _guestAreaSelector + 'a[href="' + infoPageUrl + '"]',

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

		tests = {

			'Should_GoToHomeView_When_ClickOnRedmicLogo': function() {

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(Config.selector.homeButton, homePageUrl));
			}
		};

	if (Config.credentials.userRole === 'guest') {
		lang.mixin(tests, {
			'Should_GoToLoginView_When_GuestUserClickOnLoginLink': function() {

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(loginLinkSelector, loginPageUrl));
			},

			'Should_GoToRegisterView_When_GuestUserClickOnRegisterLink': function() {

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(registerLinkSelector, registerPageUrl));
			},

			'Should_GoToInfoView_When_GuestUserClickOnInfoLink': function() {

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(infoLinkSelector, infoPageUrl));
			}
		});
	} else {
		lang.mixin(tests, {
			'Should_FindUserArea_When_UserIsRegistered': function() {

				return indexPage
					.login()
					.findByCssSelector(Config.selector.userArea);
			},

			'Should_FindNotificationArea_When_UserIsRegistered': function() {

				return indexPage
					.login()
					.findByCssSelector(Config.selector.notificationArea);
			}
		});
	}

	registerSuite('Topbar component tests', {
		before: function() {

			indexPage = new LoginPage(this);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: tests
	});
});
