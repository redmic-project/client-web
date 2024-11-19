define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/_Page'
	, 'test/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, _Page
	, Utils
	, _Commons
) {

	var indexPage;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new _Page(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_GoToItemView_When_ClickedOnButton: function() {

					var viewUrlExpr = '/[0-9]+',
						buttonSelector = 'div.tabs div.tab a[href]';

					return this.remote
						.then(Utils.clickElement(buttonSelector))
						.then(Utils.checkUrl(viewUrlExpr));
				}
			}
		}
	});
});
