define([
	'dojo/_base/declare'
	, 'tests/support/tests/_CatalogBase'
], function(
	declare
	, _CatalogBaseTests
) {

	new declare(_CatalogBaseTests, {

		constructor: function(args) {

			this._registerListWithTextSearchTests(this.namePrefix + ' list' + this.nameSuffix);

			this._registerCatalogLinksTests(this.namePrefix + ' links' + this.nameSuffix);

			this._registerCatalogFacetsTests(this.namePrefix + ' facets' + this.nameSuffix);
		}
	})({
		urlValue: '/service-ogc-catalog',
		textSearchValue: 'citation',
		namePrefix: 'Service OGC page'
	});
});
