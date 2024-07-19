define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/pages/ListWithTreeFilter'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, ListWithTreeFilterPage
	, Utils
	, _Commons
) {

	var indexPage,
		treeFilterItemPosition = 3,

		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new ListWithTreeFilterPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_UpdateListTotalResults_When_SelectTreeFilterItem: function() {

					var values = {};

					return this.remote
						.then(indexPage.showTreeFilter())
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							values.originalTotal = count;
						}, values))
						.then(indexPage.toggleTreeFilterItemSelection(treeFilterItemPosition))
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							assert.notStrictEqual(count, values.totalInTreeItem,
								'El total de resultados del listado no se ha actualizado tras filtrar');
						}, values));
				},

				Should_RestoreOriginalListTotalResults_When_DeselectSelectedTreeFilterItem: function() {

					var values = {};

					return this.remote
						.then(indexPage.showTreeFilter())
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							values.originalTotal = count;
						}, values))
						.then(indexPage.toggleTreeFilterItemSelection(treeFilterItemPosition))
						.then(indexPage.toggleTreeFilterItemSelection(treeFilterItemPosition))
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							assert.strictEqual(count, values.originalTotal,
								'El total de resultados del listado no se ha restaurado tras cancelar el filtro');
						}, values));
				},

				Should_UpdateListTotalResultsToFilterTotalResults_When_SelectTreeFilterItem: function() {

					var values = {};

					return this.remote
						.then(indexPage.showTreeFilter())
						.then(indexPage.getTreeFilterItemCounter(treeFilterItemPosition))
						.then(lang.partial(function(values, itemCount) {

							values.totalInTreeItem = itemCount;
						}, values))
						.then(indexPage.toggleTreeFilterItemSelection(treeFilterItemPosition))
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							assert.strictEqual(count, values.totalInTreeItem,
								'El total del filtro del árbol no coincide con el total obtenido tras filtrar');
						}, values));
				}
			}
		}
	});
});
