define([
	'dojo/_base/declare'
	, 'test/support/tests/_CatalogBase'
], function(
	declare
	, _CatalogBase
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			this._registerCatalogLinksTests(this.namePrefix + ' links' + this.nameSuffix);
		}
	});
});
