define([
	'dojo/_base/declare'
	, 'test/support/tests/CatalogFacets'
	, 'test/support/tests/CatalogFacetsTotal'
	, 'test/support/tests/CatalogLinks'
	, 'test/support/tests/Filter'
	, 'test/support/tests/ListSelection'
	, 'test/support/tests/ListWithOrder'
	, 'test/support/tests/ListWithTextSearch'
	, './_BaseCommons'
], function(
	declare
	, CatalogFacetsTests
	, CatalogFacetsTotalTests
	, CatalogLinksTests
	, FilterTests
	, ListSelectionTests
	, ListWithOrderTests
	, ListWithTextSearchTests
	, _BaseCommons
) {

	return declare(_BaseCommons, {

		constructor: function(args) {},

		_registerListSelectionTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: ListSelectionTests
			});
		},

		_registerListWithTextSearchTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: ListWithTextSearchTests,
				properties: {
					textSearchValue: this.textSearchValue
				}
			});
		},

		_registerListWithOrderTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: ListWithOrderTests,
				properties: {
					newOrderingValue: this.newOrderingValue
				}
			});
		},

		_registerCatalogLinksTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogLinksTests
			});
		},

		_registerCatalogFacetsTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogFacetsTests
			});
		},

		_registerCatalogFacetsTotalTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogFacetsTotalTests
			});
		},

		_registerFilterTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: FilterTests
			});
		}
	});
});
