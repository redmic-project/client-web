define([
	'dojo/_base/declare'
	, 'tests/support/tests/_CatalogBase'
], function(
	declare
	, _CatalogBase
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			this._registerCatalogFacetsTests(this.namePrefix + ' facets' + this.nameSuffix);

			this._registerCatalogFacetsTotalTests(this.namePrefix + ' facets total' + this.nameSuffix);
		}
	});
});
