define([
	'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/Login'
	, 'tests/support/Utils'
], function(
	lang
	, Config
	, LoginPage
	, Utils
) {

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		indexPage,
		tests = {
			'Should_GoToActivityInfo_When_ClickOnStarredActivitiesLink': function() {

				var starredActivityLinkSelector = 'div.moduleWindow[id=starredActivities] div.containerButtons > a:first-child',
					activityInfoUrlExpr = '\/catalog\/activity-info\/[0-9]+';

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(starredActivityLinkSelector, activityInfoUrlExpr));
			},

			'Should_GoToValidView_When_ClickOnProductsLink': function() {

				var productsLinkSelector = 'div.moduleWindow[id=products] div.containerButtons > a:first-child',
					validViewUrlExpr = '\/(?!404)(?!home).*';

				return indexPage
					.login()
					.then(Utils.clickElementAndCheckUrl(productsLinkSelector, validViewUrlExpr));
			},

			'Should_GoToFeedback_When_ClickOnFeedbackLink': function() {

				var feedbackPageUrl = Config.url.feedback,
					feedbackLinkSelector = 'div.moduleWindow[id=info] a[href="' + feedbackPageUrl + '"]';

				return indexPage
					.login()
					.getAllWindowHandles()
					.then(function(handles) {

						assert.lengthOf(handles, 1, 'Había abierta más de 1 pestaña');
					})
					.then(Utils.clickElement(feedbackLinkSelector))
					.sleep(Config.timeout.shortSleep)
					.getAllWindowHandles()
					.then(function(handles) {

						assert.lengthOf(handles, 2, 'No se ha abierto ninguna pestaña');

						return this.parent
							.switchToWindow(handles[handles.length - 1])
							.sleep(Config.timeout.shortSleep)
							.then(Utils.checkUrl(feedbackPageUrl))
							.then(Utils.checkLoadingIsGone())
							.closeCurrentWindow()
							.switchToWindow(handles[0]);
					});
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
