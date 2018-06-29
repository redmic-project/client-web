define([
	'dojo/_base/declare'
	, 'tests/support/tests/CatalogFacets'
	, 'tests/support/tests/CatalogFacetsTotal'
	, 'tests/support/tests/CatalogLinks'
	, 'tests/support/tests/Filter'
	, 'tests/support/tests/ListSelection'
	, 'tests/support/tests/ListWithAllItemsAndInvertSelection'
	, 'tests/support/tests/ListWithOrder'
	, 'tests/support/tests/ListWithTextSearch'
	, './_BaseCommons'
], function(
	declare
	, CatalogFacetsTests
	, CatalogFacetsTotalTests
	, CatalogLinksTests
	, FilterTests
	, ListSelectionTests
	, ListWithAllItemsAndInvertSelectionTests
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

			this._mixPropsAndRegisterTests({
				suiteName: suiteName + ' 2',
				definition: ListWithAllItemsAndInvertSelectionTests
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
