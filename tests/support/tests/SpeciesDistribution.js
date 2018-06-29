define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/ListWithTextSearch'
	, 'tests/support/pages/ListWithTreeFilter'
	, 'tests/support/pages/Map'
	, 'tests/support/Utils'
	, 'tests/support/tests/Atlas'
	, 'tests/support/tests/AtlasWithClickMap'
	, 'tests/support/tests/ListSelection'
	, 'tests/support/tests/ListWithTextSearch'
	, 'tests/support/tests/Map'
	, './_Commons'
], function (
	declare
	, lang
	, Config
	, ListWithTextSearchPage
	, ListWithTreeFilterPage
	, MapPage
	, Utils
	, AtlasTests
	, AtlasWithClickMapTests
	, ListSelectionTests
	, ListWithTextSearchTests
	, MapTests
	, _Commons
) {

	var indexPage,
		assert = intern.getPlugin('chai').assert,
		infoPopupSelector = 'div.dijitDialog',
		infoPopupContentSelector = infoPopupSelector + ' div.dijitContentPane.dualContent',
		svgGridSelector = 'svg g.leaflet-zoom-hide ',

		contentGridMode = [{
			selectorInMap: svgGridSelector + 'g'
		},{
			selectorInMap: svgGridSelector + 'g text'
		},{
			selectorInMap: svgGridSelector + 'g text'
		},{
			selectorInMap: 'div.leaflet-pane div.awesome-marker'
		}],

		sizeGridMode = [{
			id: 'grid5000m'
		},{
			id: 'grid1000m'
		},{
			id: 'grid500m'
		},{
			id: 'grid100m'
		}],

		selectItems = function() {

			return function() {

				return this.parent
					.then(Utils.clickInToTab(2))
					.then(Utils.checkLoadingIsGone())
					.then(indexPage.toggleTreeFilterItemSelection(2));
			};
		},

		clickInput = function(id, input, value) {

			return function() {

				return this.parent
					.then(Utils.clickElement('form fieldset[id="' + id + '"] input[type="' + input +
						'"][value="' + value + '"]'));
			};
		};

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new declare([ListWithTextSearchPage, ListWithTreeFilterPage, MapPage])(this);
				this.externalContext.setIndexPage(indexPage);
			},

			beforeEach: function(test) {

				return this.externalContext.goToIndexPage()
					.then(indexPage.clearSelection())
					.then(Utils.checkLoadingIsGone());
			},

			tests: {

				Should_ShowInfoPopup_When_SelectSpeciesAndClickOnMap: function() {

					return this.remote
						.then(selectItems())
						.then(Utils.checkLoadingIsGone())
						.then(Utils.clickElement(svgGridSelector + 'g'))
						.findByCssSelector(infoPopupContentSelector);
				},

				Should_ChangeContentGrid_When_SelectOptions: function() {

					var context = this.remote
						.then(selectItems())
						.then(Utils.clickInToTab(3));

					for (var i = contentGridMode.length - 1; i >= 0; i--) {
						var item = contentGridMode[i];

						context = context
							.then(clickInput('modeGrid', 'radio', i))
							.then(Utils.checkLoadingIsGone())
							.findByCssSelector(item.selectorInMap)
								.end()
							.sleep(Config.timeout.shortSleep);
					}

					return context;
				},

				Should_ChangeSizeGrid_When_SelectOptions: function() {

					var context = this.remote.then(Utils.clickInToTab(3)),
						checkGridURL = function(gridId, value) {

							var regex = new RegExp(gridId, 'g');

							assert.match(value, regex, 'No se han encontrado teselas del grid cargado');
						};

					for (var i = sizeGridMode.length - 1; i >= 0; i--) {
						var item = sizeGridMode[i];

						context = context
							.then(clickInput('changeGrid', 'radio', i))
							.then(Utils.checkLoadingIsGone())
							.findByCssSelector('div.leaflet-pane.leaflet-map-pane div.leaflet-overlay-pane > img')
								.getAttribute('src')
								.then(lang.partial(checkGridURL, item.id))
								.end()
							.sleep(Config.timeout.shortSleep);
					}

					return context;
				},

				/*Should_SelectSpecies_When_SelectItemInTree: function() {

					var treeSelector = 'div.dijitTreeIsRoot.dijitTreeNode > div ',
						values = {};

					return this.remote
						.then(Utils.clickInToTab(2))
						.findByCssSelector(treeSelector + 'span[data-dojo-attach-point="contentNode"] span[role="treeitem"]')
							.getVisibleText()
							.then(lang.partial(function(values, text) {

								values.count = parseInt(text.replace(/.*\(([0-9]+)\)/g, '$1'), 10);
							}, values))
							.end()
						.then(Utils.clickElement(treeSelector + 'div.cbtreeCheckBox input'))
						.then(Utils.checkLoadingIsGone())
						.then(Utils.clickInToTab(1))
						.then(indexPage.getSelectedItemsCount())
						.then(lang.partial(function(values, count) {

							assert.strictEqual(values.count, count, 'El total de seleccionados no es el esperado');
						}, values));
				},*/

				Should_ChangeConfidences_When_SelectOptions: function() {

					var values = {},
						context = this.remote
							.then(selectItems())
							.then(Utils.clickInToTab(3)),
						checkIdSvgGrid = function(values, count) {

							assert.notEqual(values.count, count, 'El total no es el esperado');
						},
						getIdSvgGrid = function() {

							return function() {

								return this.parent
									.findByCssSelector(svgGridSelector)
										.then(function(obj) {

											return obj._elementId;
										});
							};
						};

					for (var i = 1; i <= 4; i++) {
						context = context
							.then(getIdSvgGrid())
							.then(lang.partial(function(values, value) {

								values.count = value;
							}, values))
							.then(clickInput('confidences', 'checkbox', i))
							.then(Utils.checkLoadingIsGone())
							.then(getIdSvgGrid())
							.then(lang.partial(checkIdSvgGrid, values))
							.then(clickInput('confidences', 'checkbox', i));
					}

					return context;
				}
			}
		},

		constructor: function(args) {

			var suiteName = ' tests in ' + (this.config.suiteName || 'Species distribution');

			Utils.registerTests({
				suiteName: 'Map' + suiteName,
				definition: MapTests,
				properties: this.config
			});

			Utils.registerTests({
				suiteName: 'ListWithTextSearch' + suiteName,
				definition: ListWithTextSearchTests,
				properties: this.config
			});

			Utils.registerTests({
				suiteName: 'ListSelection' + suiteName,
				definition: ListSelectionTests,
				properties: this.config
			});

			var obj = lang.clone(this.config);

			obj.afterGoToIndexPage = function() {

				return function() {

					return this.parent
						.then(Utils.clickInToTab(4));
				};
			};

			obj.suiteName = 'Atlas' + suiteName;

			Utils.registerTests({
				suiteName: 'Atlas' + suiteName,
				definition: AtlasTests,
				properties: obj
			});

			obj.suiteName = 'Atlas with click map' + suiteName;

			Utils.registerTests({
				suiteName: 'Atlas with click map' + suiteName,
				definition: AtlasWithClickMapTests,
				properties: obj
			});
		}
	});
});
