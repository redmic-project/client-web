define([
	'dojo/_base/declare'
	, 'tests/support/tests/_CatalogBase'
], function(
	declare
	, _CatalogBase
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			this._registerFilterTests(this.namePrefix + ' filter' + this.nameSuffix);
		}
	});
});
