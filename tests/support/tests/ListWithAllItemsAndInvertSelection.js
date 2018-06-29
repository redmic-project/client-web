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

	var indexPage,
		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_HaveSameValueInTotalAndSelectedCounters_When_SelectAllItems: function() {

					var values = {};

					return this.remote
						.then(indexPage.selectAllItems())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							values.totalCount = count;
						}, values))
						.then(indexPage.getSelectedItemsCount())
						.then(lang.partial(function(values, count) {

							assert.strictEqual(count, values.totalCount,
								'El total de seleccionados no coincide con el total de elementos al seleccionar todo');
						}, values));
				},

				Should_SelectAllItemsExceptOne_When_InvertSingleSelection: function() {

					var values = {};

					return this.remote
						.then(indexPage.selectItem(1))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.invertSelection())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							values.totalCount = count;
						}, values))
						.then(indexPage.getSelectedItemsCount())
						.then(lang.partial(function(values, count) {

							assert.strictEqual(count, values.totalCount - 1,
								'El total de seleccionados no coincide con el esperado');
						}, values));
				}
			}
		}
	});
});
