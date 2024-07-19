define([
	'module'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	module
	, Config
	, Utils
) {

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	var indexPageUrl,
		timeout = Config.timeout.findElement;

	var facetsBucketCssSelector = 'div[data-redmic-id="themeInspire"].bucket',
		facetsOpenedGroupCssSelector = 'div.containerFacets > div.dijitTitlePane:first-child',
		facetsClosedGroupCssSelector = 'div.containerFacets > div.dijitTitlePane:last-child',
		facetsGroupTitleCssSelectorSuffix = ' > div.dijitTitlePaneTitle',
		facetsGroupContentCssSelectorSuffix = ' > div.dijitTitlePaneContentOuter',
		facetsGroupToggleCssSelectorSuffix = ' > span.collapseToggle';


	registerSuite('FacetsImpl (Search module)', {
		before: function() {

			this.remote.setFindTimeout(timeout);
			indexPageUrl = Utils.getTestPageUrl(module.uri);
		},

		beforeEach: function() {

			return this.remote.get(indexPageUrl);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: {
			Should_FindFacetsGroup_When_AddedByStartupConfig: function() {

				return this.remote
					.findByCssSelector(facetsBucketCssSelector)
					.isDisplayed()
					.then(function(displayed) {

						assert.isTrue(displayed, 'El grupo de facets no se ha encontrado');
					}).end();
			},

			Should_CheckFacetCheckbox_When_FacetLabelIsPressed: function() {

				var facetCssSelector = facetsBucketCssSelector + ' > div.containerBucket:first-child',
					facetLabelCssSelector = facetCssSelector + ' label',
					facetInputCssSelector = facetCssSelector + ' input';

				return this.remote
					.findByCssSelector(facetLabelCssSelector).click().end()
					.findByCssSelector(facetInputCssSelector).getProperty('checked')
					.then(function(checked) {

						assert.strictEqual(checked, true, 'El checkbox no se ha marcado tras pulsar el label');
					}).end();
			},

			Should_CloseFacetsGroup_When_OpenedFacetsGroupTitleIsPressed: function() {

				var facetsGroupTitleCssSelector = facetsOpenedGroupCssSelector + facetsGroupTitleCssSelectorSuffix,
					facetsGroupContentCssSelector = facetsOpenedGroupCssSelector + facetsGroupContentCssSelectorSuffix;

				return this.remote
					.findByCssSelector(facetsGroupContentCssSelector).isDisplayed()
					.then(function(displayed) {

						assert.isTrue(displayed, 'El grupo de facets no se ha encontrado antes de ocultarlo');
					}).end()
					.findByCssSelector(facetsGroupTitleCssSelector).click().end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(facetsGroupContentCssSelector).isDisplayed()
					.then(function(displayed) {

						assert.isFalse(displayed, 'El grupo de facets se ha encontrado después de ocultarlo');
					}).end();
			},

			Should_OpenFacetsGroup_When_ClosedFacetsGroupTitleIsPressed: function() {

				var facetsGroupTitleCssSelector = facetsClosedGroupCssSelector + facetsGroupTitleCssSelectorSuffix,
					facetsGroupContentCssSelector = facetsClosedGroupCssSelector + facetsGroupContentCssSelectorSuffix;

				return this.remote
					.findByCssSelector(facetsGroupContentCssSelector).isDisplayed()
					.then(function(displayed) {

						assert.isFalse(displayed, 'El grupo de facets se ha encontrado antes de mostrarlo');
					}).end()
					.findByCssSelector(facetsGroupTitleCssSelector).click().end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(facetsGroupContentCssSelector).isDisplayed()
					.then(function(displayed) {

						assert.isTrue(displayed, 'El grupo de facets no se ha encontrado después de mostrarlo');
					}).end();
			},

			Should_NotFindFacetsGroupShowMoreButton_When_FacetsGroupIsLongAndIsClosed: function() {

				var facetsGroupToggleCssSelector = facetsClosedGroupCssSelector + facetsGroupToggleCssSelectorSuffix;

				return this.remote
					.findByCssSelector(facetsGroupToggleCssSelector).isDisplayed()
					.then(function(displayed) {

						assert.isFalse(displayed, 'El toggle de facets se ha encontrado antes de mostrar el grupo');
					}).end();
			},

			Should_FindFacetsGroupShowMoreButton_When_FacetsGroupIsLongAndIsOpened: function() {

				var facetsGroupTitleCssSelector = facetsClosedGroupCssSelector + facetsGroupTitleCssSelectorSuffix,
					facetsGroupToggleCssSelector = facetsClosedGroupCssSelector + facetsGroupToggleCssSelectorSuffix;

				return this.remote
					.findByCssSelector(facetsGroupTitleCssSelector).click().end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(facetsGroupToggleCssSelector).isDisplayed()
					.then(function(displayed) {

						assert.isTrue(displayed, 'El toggle de facets no se ha encontrado después de mostrar el grupo');
					}).end();
			},

			Should_ExpandFacetsGroup_When_FacetsGroupShowMoreIsPressed: function() {

				var facetsGroupTitleCssSelector = facetsClosedGroupCssSelector + facetsGroupTitleCssSelectorSuffix,
					facetsGroupContentCssSelector = facetsClosedGroupCssSelector + facetsGroupContentCssSelectorSuffix,
					facetsGroupToggleCssSelector = facetsClosedGroupCssSelector + facetsGroupToggleCssSelectorSuffix,
					prevHeight;

				return this.remote
					.findByCssSelector(facetsGroupTitleCssSelector).click().end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(facetsGroupContentCssSelector).getSize()
					.then(function(size) {

						prevHeight = size.height;
					}).end()
					.findByCssSelector(facetsGroupToggleCssSelector).click().end()
					.findByCssSelector(facetsGroupContentCssSelector).getSize()
					.then(function(size) {

						assert.isAbove(size.height, prevHeight,
							'El toggle de facets no ha aumentado la altura del contenedor del grupo al expandir');
					}).end();
			},

			Should_CollapseFacetsGroup_When_FacetsGroupShowLessIsPressed: function() {

				var facetsGroupTitleCssSelector = facetsClosedGroupCssSelector + facetsGroupTitleCssSelectorSuffix,
					facetsGroupContentCssSelector = facetsClosedGroupCssSelector + facetsGroupContentCssSelectorSuffix,
					facetsGroupToggleCssSelector = facetsClosedGroupCssSelector + facetsGroupToggleCssSelectorSuffix,
					prevHeight;

				return this.remote
					.findByCssSelector(facetsGroupTitleCssSelector).click().end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(facetsGroupToggleCssSelector).click().end()
					.findByCssSelector(facetsGroupContentCssSelector).getSize()
					.then(function(size) {

						prevHeight = size.height;
					}).end()
					.findByCssSelector(facetsGroupToggleCssSelector).click().end()
					.findByCssSelector(facetsGroupContentCssSelector).getSize()
					.then(function(size) {

						assert.isBelow(size.height, prevHeight,
							'El toggle de facets no ha reducido la altura del contenedor del grupo al contraer');
					}).end();
			}
		}
	});
});
