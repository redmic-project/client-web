define([
	'dojo/_base/declare'
	, 'test/support/tests/_CatalogBase'
], function(
	declare
	, _CatalogBase
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			this._registerListSelectionTests(this.namePrefix + ' selection' + this.nameSuffix);

			this._registerListWithTextSearchTests(this.namePrefix + ' list' + this.nameSuffix);

			this._registerListWithOrderTests(this.namePrefix + ' order list' + this.nameSuffix);

			this._registerCatalogLinksTests(this.namePrefix + ' links' + this.nameSuffix);

			this._registerCatalogFacetsTests(this.namePrefix + ' facets' + this.nameSuffix);

			this._registerCatalogFacetsTotalTests(this.namePrefix + ' facets total' + this.nameSuffix);
		}
	});
});
