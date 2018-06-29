define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/List'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, Config
	, ListPage
	, Utils
	, _Commons
) {

	var alertSelector = Config.selector.alert,
		alertContentSelector = alertSelector + ' > div.ajs-body > div.ajs-content',
		reportButtonSelector;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				this.externalContext.setIndexPage(new ListPage(this));

				reportButtonSelector =
					Utils.getProperties(this, 'reportButtonSelector') || Config.selector.topbarReportButton;
			},

			tests: {

				Should_ShowBanAlert_When_ClickOnReportButton: function() {

					var banIconSelector = alertContentSelector + ' > i.fa-ban';

					return this.remote
						.then(Utils.clickElement(reportButtonSelector))
						.findByCssSelector(banIconSelector);
				},

				Should_ShowValidRegisterLink_When_ClickOnReportButton: function() {

					var registerPageUrl = Config.url.register,
						registerLinkSelector = alertContentSelector + ' a[href="' + registerPageUrl + '"]';

					return this.remote
						.then(Utils.clickElement(reportButtonSelector))
						.then(Utils.clickDisplayedElementAndCheckUrl(registerLinkSelector, registerPageUrl));
				},

				Should_ShowValidTermsLink_When_ClickOnReportButton: function() {

					var termsPageUrl = Config.url.terms,
						termsLinkSelector = alertContentSelector + ' a[href="' + termsPageUrl + '"]';

					return this.remote
						.then(Utils.clickElement(reportButtonSelector))
						.then(Utils.clickDisplayedElementAndCheckUrl(termsLinkSelector, termsPageUrl));
				}
			}
		}
	});
});
