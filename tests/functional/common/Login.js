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

		missingValuesMsg = 'Este valor es necesario.',
		badValuesMsg = 'Bad credentials';

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		tests = {
			'Should_GoToWhatIsRedmic_When_ClickOnUrl': function() {

				var whatIsRedmicPageUrl = Config.url.redmicInfo,
					whatIsRedmicSelector = 'footer > div:nth-child(3)';

				return indexPage
					.goToUrl()
					.then(Utils.acceptCookies())
					.then(Utils.clickElementAndCheckUrl(whatIsRedmicSelector, whatIsRedmicPageUrl));
			},

			'Should_GoToRecoverPassword_When_ClickOnUrl': function() {

				var recoverPageUrl = Config.url.recover,
					recoverLinkSelector = 'a[href="' + recoverPageUrl + '"]';

				return indexPage
					.goToUrl()
					.then(Utils.clickElementAndCheckUrl(recoverLinkSelector, recoverPageUrl));
			},

			'Should_GoToRegister_When_ClickOnUrl': function() {

				var registerPageUrl = Config.url.register,
					registerLinkSelector = 'a[href="' + registerPageUrl + '"]';

				return indexPage
					.goToUrl()
					.then(Utils.clickElementAndCheckUrl(registerLinkSelector, registerPageUrl));
			},

			'Should_ShowMissingValuesError_When_LoginWithEmptyCredentials': function() {

				var missingValuesNotificationSelector = 'div[role="alert"]';

				return indexPage
					.goToUrl()
					.then(indexPage.setCredentials('', ''))
					.then(indexPage.clickLogin())
					.findByCssSelector(missingValuesNotificationSelector)
						.getVisibleText()
						.then(function(text) {

							assert.strictEqual(text, missingValuesMsg, 'El error de valores vacíos no aparece');
						});
			},

			'Should_ShowBadValuesError_When_LoginWithUnregisteredCredentials': function() {

				var errorNotificationSelector = 'div.alertify-notifier div.ajs-error.ajs-visible',
					badPassword = 'badPassword',
					badUsername = 'pepe@redmic.es';

				return indexPage
					.goToUrl()
					.then(indexPage.setCredentials(badUsername, badPassword))
					.then(indexPage.clickLogin())
					.sleep(Config.timeout.longSleep)
					.findByCssSelector(errorNotificationSelector)
						.sleep(Config.timeout.longSleep)
						.getVisibleText()
						.then(function(text) {

							assert.strictEqual(text, badValuesMsg, 'El error de valores inválidos no aparece');
						});
			}
		};

	if (Config.credentials.userRole === 'guest') {
		lang.mixin(tests, {
			'Should_SucceedOnGuestLogin_When_ClickOnGuestAccess': function() {

				return indexPage.login();
			}
		});
	} else {
		lang.mixin(tests, {
			'Should_SucceedOnUserLogin_When_AccessWithValidCredentials': function() {

				return indexPage.login();
			}
		});
	}

	registerSuite('Login page tests', {
		before: function() {

			indexPage = new LoginPage(this);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: tests
	});
});
