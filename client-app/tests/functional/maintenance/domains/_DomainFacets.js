define([
	'dojo/_base/declare'
	, 'tests/support/tests/CatalogFacets'
	, 'tests/support/tests/CatalogFacetsTotal'
	, './_DomainBase'
], function(
	declare
	, CatalogFacetsTests
	, CatalogFacetsTotalTests
	, _DomainBase
) {

	return declare(_DomainBase, {

		constructor: function(args) {

			this._registerCatalogFacetsTests(this.namePrefix + ' facets' + this.nameSuffix);
			this._registerCatalogFacetsTotalTests(this.namePrefix + ' facets total' + this.nameSuffix);
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
		}
	});
});
