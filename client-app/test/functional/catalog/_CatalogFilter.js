define([
	'dojo/_base/declare'
	, 'test/support/Config'
	, 'test/support/tests/_CatalogBase'
], function(
	declare
	, Config
	, _CatalogBase
) {

	return declare(_CatalogBase, {

		constructor: function(args) {

			if (!this.onlyAdministrator || Config.credentials.userRole === 'administrator') {

				this._registerFilterTests(this.namePrefix + ' filter' + this.nameSuffix);
			}
		}
	});
});
