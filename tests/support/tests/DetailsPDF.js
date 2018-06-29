define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/_Page'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, _Page
	, Config
	, Utils
	, _Commons
) {

	var indexPage,
		tests = {
			Should_GoToItemInfoView_When_ClickedOnInfoButton: function() {

				var infoViewUrlExpr = '-info/[0-9]+',
					infoButtonSelector = 'div.tabs div.tabSelect a';

				return this.remote
					.then(Utils.clickElement(infoButtonSelector))
					.sleep(Config.timeout.shortSleep)
					.then(Utils.checkUrl(infoViewUrlExpr));
			}
		};

	if (Config.credentials.userRole === 'guest') {
		lang.mixin(tests, {
			Should_SeeMessage_When_EnterInView: function() {

				return this.remote
					.sleep(Config.timeout.longSleep)
					.findByCssSelector('div.windowContent div.viewerPDFAuthFailed');
			}
		});
	} else {
		lang.mixin(tests, {
			Should_SeePDF_When_EnterInView: function() {

				return this.remote
					.sleep(Config.timeout.longSleep)
					.findByCssSelector(Config.selector.pdfViewer);
			}
		});
	}

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new _Page(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: tests
		}
	});
});
