define([
	'dojo/_base/declare'
	, 'test/support/pages/List'
	, 'test/support/Utils'
	, './_Commons'
], function (
	declare
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

				Should_GoToAddItemPage_When_ClickAddItemButton: function() {

					var urlExpr = 'add/new';

					return this.remote
						.then(indexPage.addItem())
						.then(Utils.checkUrl(urlExpr))
						.then(Utils.checkLoadingIsGone());
				},

				Should_GoToEditItemPage_When_ClickEditItemButton: function() {

					var urlExpr = 'edit/[0-9a-z\-]+';

					return this.remote
						.then(indexPage.editItem(1))
						.then(Utils.checkUrl(urlExpr))
						.then(Utils.checkLoadingIsGone());
				}
			}
		}
	});
});
