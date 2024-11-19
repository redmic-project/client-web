define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/ListWithTextSearchAndFacets'
	, 'test/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListWithTextSearchAndFacetsPage
	, Utils
	, _Commons
) {

	var indexPage,
		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListWithTextSearchAndFacetsPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_UpdateListContent_When_SelectFacetsOption: function() {

					var values = {};

					return this.remote
						.then(indexPage.getLoadedListRowsTitleId())
						.then(lang.partial(function(values, idArr) {

							values.oldIds = idArr;
						}, values))
						.then(indexPage.selectFacetFirstNoZero())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getLoadedListRowsTitleId())
						.then(lang.hitch(this, function(values, idArr) {

							var oldIds = values.oldIds;

							if (oldIds.length > 1) {
								Utils.notSameOrderedMembers(oldIds, idArr,
									'No se ha actualizado el listado tras filtrar');
							}
						}, values));
				}
			}
		}
	});
});
