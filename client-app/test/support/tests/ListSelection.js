define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/pages/List'
	, 'test/support/Utils'
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

				Should_ChangeItemSelectionStatus_When_ClickedOnRowCheckbox: function() {

					return this.remote
						.then(indexPage.selectItem(1))
						.then(indexPage.getSelectedItemsCount())
						.then(function(count) {

							assert.strictEqual(count, 1, 'No hay un elemento seleccionado tras seleccionar');
						})
						.then(indexPage.selectItem(1))
						.then(indexPage.getSelectedItemsCount())
						.then(function(count) {

							assert.strictEqual(count, 0, 'Hay un elemento seleccionado tras deseleccionar');
						});
				},

				Should_UpdateListContentAndResults_When_ChangeDataToShowMode: function() {

					return this.remote
						.then(indexPage.selectItem(1))
						.then(indexPage.setModeToShowSelectedOnly())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getTotalItemsCount())
						.then(function(count) {

							assert.strictEqual(count, 1, 'El total de elementos no corresponde con la selección');
						})
						.then(indexPage.setModeToShowAll())
						.then(indexPage.getTotalItemsCount())
						.then(function(count) {

							assert.isAbove(count, 1, 'El total de elementos no se ha actualizado al mostrar todo');
						});
				},

				Should_ShowEmptyMessage_When_ShowingSelectedOnlyAndDeselectLastSelectedItem: function() {

					return this.remote
						.then(indexPage.selectItem(1))
						.then(indexPage.setModeToShowSelectedOnly())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.selectItem(1))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getEmptyListMessage());
				},

				Should_ClearSelection_When_SelectClearSelectionWithNotEmptyPreviousSelection: function() {

					return this.remote
						.then(indexPage.selectItem(1))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.clearSelection())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getSelectedItemsCount())
						.then(function(count) {

							assert.strictEqual(count, 0, 'La selección no es vacía');
						});
				}
			}
		}
	});
});
