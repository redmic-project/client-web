define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/ListHierarchical'
	, 'tests/support/pages/ListWithTextSearch'
	, 'tests/support/pages/Map'
	, 'tests/support/Utils'
	, 'tests/support/tests/ListHierarchical'
	, 'tests/support/tests/ListHierarchicalWithSelection'
	, 'tests/support/tests/Map'
	, './_Commons'
], function (
	declare
	, lang
	, Config
	, ListHierarchicalPage
	, ListWithTextSearchPage
	, MapPage
	, Utils
	, ListHierarchicalTests
	, ListHierarchicalWithSelectionTests
	, MapTests
	, _Commons
) {

	var indexPage,
		assert = intern.getPlugin('chai').assert,

		layerRowTextInListForTesting = 'Batim',
		infoPopupSelector = 'div.dijitDialog',
		infoPopupContentSelector = infoPopupSelector + ' div.dijitContentPane.dualContent',
		infoPopupCloseButtonSelector = infoPopupSelector + ' div.dijitDialogTitleBar span.fa-close',

		goToLayers = function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(Config.selector.notLoading + ' div.topZone div.iconKeypad i.fa-reply'))
					.sleep(Config.timeout.longSleep);
			};
		},

		goToCatalogLayers = function() {

			return function() {

				return this.parent
					.then(Utils.clickElement('div.topZone div.iconKeypad i.fa-plus'))
					.sleep(Config.timeout.longSleep);
			};
		},

		closeLayerInfoPopup = function() {

			return function() {

				return this.parent
					.then(Utils.clickDisplayedElement(infoPopupCloseButtonSelector))
						.sleep(Config.timeout.shortSleep)
						.end();
			};
		};

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new declare([ListHierarchicalPage, ListWithTextSearchPage, MapPage])(this);
				this.externalContext.setIndexPage(indexPage);
			},

			beforeEach: function(test) {

				return this.externalContext
					.goToIndexPage()
					.then(indexPage.clearSelection())
					.then(Utils.checkLoadingIsGone());
			},

			tests: {

				Should_ShowNoLayersMessage_When_ClearSelection: function() {

					return this.remote
						.then(goToLayers())
						.then(indexPage.getEmptyListMessage())
						.then(function(node) {
							node.click();
						})
						.then(goToLayers());
				},

				Should_AddAndRemoveLayer_When_SelectAndDeselectItems: function() {

					return this.remote
						.then(indexPage.selectItem(1))
						.then(goToLayers())
						.then(indexPage.getTotalItemsCount())
						.then(function(count) {

							assert.isAbove(count, 0, 'No se han añadido capas');
						})
						.then(goToCatalogLayers())
						.then(indexPage.clearSelection())
						.then(goToLayers())
						.then(indexPage.getTotalItemsCount())
						.then(function(count) {

							assert.strictEqual(count, 0, 'No se han eliminado las capas');
						});
				},

				Should_RemoveLayer_When_ClickInRemoveIcon: function() {

					var values = {};

					return this.remote
						.then(indexPage.selectItem(1))
						.then(goToLayers())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getLayersCount())
						.then(lang.partial(function(values, count) {

								values.layersMapCount = count;
								assert.isAbove(count, 0, 'No se han añadido capas');
						}, values))
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							return function(self) {

								values.layersListCount = count;
								assert.isAbove(count, 0, 'No se han añadido capas');

								return self.parent
									.then(indexPage.clickRowButton(1, 'fa-trash-o'));
							}(this);
						}, values))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getTotalItemsCount())
						.then(lang.partial(function(values, count) {

							assert.isBelow(count, values.layersListCount, 'No se ha eliminado la capa del listado');
						}, values))
						.then(goToCatalogLayers())
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getSelectedItemsCount())
						.then(lang.partial(function(values, count) {

							assert.isAtMost(count, values.layersListCount, 'No se ha deseleccionado la capa');
						}, values))
						.then(indexPage.getLayersCount())
						.then(lang.partial(function(values, count) {

							assert.isBelow(count, values.layersMapCount, 'No se ha eliminado la capa del mapa');
						}, values));
				},

				Should_DeactivateAndActivateLayer_When_ClickInToggleIcon: function() {

					var values = {};

					return this.remote
						.then(indexPage.selectItem(1))
						.then(Utils.checkLoadingIsGone())
						.then(goToLayers())
						.then(indexPage.getLayersCount())
						.then(lang.partial(function(values, count) {

							return function(self) {

								values.layersCount = count;
								assert.isAbove(count, 0, 'No se han añadido capas');

								return self.parent
									.then(indexPage.clickRowButton(1, 'fa-toggle-on'));
							}(this);
						}, values))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getLayersCount())
						.then(lang.partial(function(values, count) {

							return function(self) {

								assert.isBelow(count, values.layersCount, 'No se ha desactivado la capa');
								return self.parent
									.then(indexPage.clickRowButton(1, 'fa-toggle-off'));
							}(this);
						}, values))
						.then(Utils.checkLoadingIsGone())
						.then(indexPage.getLayersCount())
						.then(lang.partial(function(values, count) {

							assert.strictEqual(count, values.layersCount, 'No se ha activado la capa');
						}, values));
				}
			}
		},

		constructor: function(args) {

			var suiteName = ' tests in ' + (this.config.suiteName || 'Atlas');

			Utils.registerTests({
				suiteName: 'Map' + suiteName,
				definition: MapTests,
				properties: this.config
			});

			Utils.registerTests({
				suiteName: 'List hierarchical' + suiteName,
				definition: ListHierarchicalTests,
				properties: this.config
			});

			Utils.registerTests({
				suiteName: 'List hierarchical selection' + suiteName,
				definition: ListHierarchicalWithSelectionTests,
				properties: this.config
			});
		}
	});
});
