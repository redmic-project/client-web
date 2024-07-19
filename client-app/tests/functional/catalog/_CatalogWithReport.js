define([
	'dojo/_base/declare'
	, 'tests/support/Config'
	, 'tests/support/tests/CatalogUserReport'
	, 'tests/support/tests/CatalogGuestReport'
	, './_Catalog'
], function(
	declare
	, Config
	, CatalogUserReportTests
	, CatalogGuestReportTests
	, _Catalog
) {

	return declare(_Catalog, {

		constructor: function(args) {

			if (Config.credentials.userRole !== 'guest') {
				this._registerCatalogUserReportTests(this.namePrefix + ' reports generation' + this.nameSuffix);
			} else {
				this._registerCatalogGuestReportTests(this.namePrefix + ' report alerts' + this.nameSuffix);
			}
		},

		_registerCatalogUserReportTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogUserReportTests
			});
		},

		_registerCatalogGuestReportTests: function(suiteName) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: CatalogGuestReportTests
			});
		}
	});
});
