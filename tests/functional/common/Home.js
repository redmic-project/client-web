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
	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		indexPage,
		tests = {

			'Should_GoToValidView_When_ClickOnFavouritesLink': function() {

				var favouriteLinkSelector = 'div.boxItems > a.module:first-child',
					validViewUrlExpr = '\/(?!404)(?!home).*';

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(favouriteLinkSelector, validViewUrlExpr));
			},

			'Should_GoToActivityInfo_When_ClickOnLastActivitiesLink': function() {

				var lastActivityLinkSelector = 'div.boxItems > div.lastActivityModule:first-child a',
					activityInfoUrlExpr = '\/catalog\/activity-info\/[0-9]+';

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(lastActivityLinkSelector, activityInfoUrlExpr));
			},

			'Should_GoToFeedback_When_ClickOnFeedbackLink': function() {

				var feedbackPageUrl = Config.url.feedback,
					feedbackLinkSelector = 'div.box a[href="' + feedbackPageUrl + '"]',
					values = {};

				return indexPage
					.login()
					.getAllWindowHandles()
					.then(lang.partial(function(values, array) {

						values.windowHandles = array;
					}, values))
					.then(Utils.clickElement(feedbackLinkSelector))
					.getAllWindowHandles()
					.then(lang.partial(function(values, array) {

						var handles = values.windowHandles;

						assert.isAbove(array.length, handles.length, 'No se ha abierto ninguna pestaña');

						return this.parent
							.switchToWindow(array[1])
							.sleep(Config.timeout.shortSleep)
							.then(Utils.checkUrl(feedbackPageUrl))
							.then(Utils.checkLoadingIsGone())
							.closeCurrentWindow()
							.switchToWindow(handles[0]);
					}, values));
			}
		};

	if (Config.credentials.userRole === 'guest') {
		lang.mixin(tests, {
			'Should_GoToRegister_When_ClickOnRegisterLink': function() {

				var registerPageUrl = Config.url.register,
					registerLinkSelector = 'div.box a[href="' + registerPageUrl + '"]';

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(registerLinkSelector, registerPageUrl));
			}
		});
	}

	registerSuite('Home page tests', {
		before: function() {

			indexPage = new LoginPage(this);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: tests
	});
});
