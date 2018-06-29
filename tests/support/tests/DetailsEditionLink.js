define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/_Page'
	, 'tests/support/Utils'
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

				Should_GoToItemEditionView_When_ClickedOnEditButton: function() {

					var editionViewUrlExpr = '-edit/[0-9]+',
						editionButtonSelector = 'div.right a[href].fa-edit';

					return this.remote
						.then(Utils.clickElement(editionButtonSelector))
						.then(Utils.checkUrl(editionViewUrlExpr))
						.then(Utils.checkLoadingIsGone());
				}
			}
		}
	});
});
