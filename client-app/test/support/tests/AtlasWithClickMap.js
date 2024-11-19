define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/Config'
	, 'test/support/pages/ListHierarchical'
	, 'test/support/pages/ListWithTextSearch'
	, 'test/support/pages/Map'
	, 'test/support/Utils'
	, 'test/support/tests/ListHierarchical'
	, 'test/support/tests/ListHierarchicalWithSelection'
	, 'test/support/tests/Map'
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

				Should_ShowLayerInfoPopup_When_AddLayerAndClickOnMap: function() {

					return this.remote
						.then(indexPage.selectRowListByText(layerRowTextInListForTesting))
						.then(indexPage.clickMapOnPoint())
						.then(Utils.checkLoadingIsGone())
						.findByCssSelector(infoPopupContentSelector);
				},

				Should_FindSameLayerInfo_When_AddLayerTwiceAndClickOnMap: function() {

					var values = {};

					return this.remote
						.then(indexPage.selectRowListByText(layerRowTextInListForTesting))
						.then(indexPage.clickMapOnPoint())
						.then(Utils.checkLoadingIsGone())
						.findByCssSelector(infoPopupContentSelector)
							.then(indexPage.getLoadedListRowsTitleText())
								.then(lang.partial(function(values, textArr) {

									values.oldTitles = textArr;
								}, values))
								.end()
							.end()

						.then(closeLayerInfoPopup())
						.then(indexPage.clearSelection())

						.then(indexPage.selectRowListByText(layerRowTextInListForTesting))
						.then(indexPage.clickMapOnPoint())
						.then(Utils.checkLoadingIsGone())
						.findByCssSelector(infoPopupContentSelector)
							.then(indexPage.getLoadedListRowsTitleText())
							.then(lang.partial(function(values, textArr) {

								values.newTitles = textArr;
							}, values))
							.end()

						.then(lang.partial(function(values) {

							var oldTitles = values.oldTitles,
								newTitles = values.newTitles;

							assert.strictEqual(oldTitles.length, newTitles.length,
								'El número de capas con info no es el mismo al consultar tras reseleccionarlas');

							assert.sameMembers(oldTitles, newTitles,
								'Los capas con info no son las mismas al consultar tras reseleccionarlas');
						}, values));
				}
			}
		}
	});
});
