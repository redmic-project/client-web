define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/List'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListPage
	, Utils
	, _Commons
) {

	var indexPage;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_GoToItemInfoView_When_ClickedOnInfoButton: function() {

					var infoViewUrlExpr = '-info/[0-9]+',
						infoButtonSelector = 'div.containerButtons a[href] i.fa-info-circle';

					return this.remote
						.then(Utils.clickElement(infoButtonSelector))
						.then(Utils.checkUrl(infoViewUrlExpr))
						.then(Utils.checkLoadingIsGone());
				}
			}
		}
	});
});
