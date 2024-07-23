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

	var indexPage;
		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListWithTextSearchAndFacetsPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_UpdateListResultsTotal_When_SelectFacetsOption: function() {

					var values = {};

					return this.remote
						.then(indexPage.getFacetsFirstSmallCountOptionCounter())
						.then(lang.partial(function(values, text) {

							values.facetCounter = parseInt(text, 10);
						}, values))
						.then(indexPage.selectFacetsFirstSmallCountOption())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, text) {

							assert.strictEqual(values.facetCounter, text,
								'El total de elementos no es el esperado para el filtro aplicado');
						}, values));
				}
			}
		}
	});
});
