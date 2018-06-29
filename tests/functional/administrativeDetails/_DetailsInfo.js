define([
	'dojo/_base/declare'
	, 'tests/support/Config'
	, 'tests/support/tests/CatalogUserReport'
	, 'tests/support/tests/CatalogGuestReport'
	, 'tests/support/tests/DetailsEditionLink'
	, 'tests/support/tests/DetailsInfo'
	, 'tests/support/tests/DetailsTabs'
	, './_DetailsBase'
], function(
	declare
	, Config
	, UserReportTests
	, GuestReportTests
	, DetailsEditionLink
	, DetailsInfo
	, DetailsTabs
	, _DetailsBase
) {

	return declare(_DetailsBase, {

		_registerOtherTests: function(namePrefix, urlValue) {

			this._registerInfoTests(namePrefix + ' info details page' + this.nameSuffix, urlValue);

			if (this.tabs) {
				this._registerTabsTests(namePrefix + ' tabs info details page' + this.nameSuffix, urlValue);
			}

			if (this.editionLink) {
				this._registerEditionLinkTests(namePrefix + ' edition link info details page' +
					this.nameSuffix, urlValue);
			}

			if (this.reports) {
				if (Config.credentials.userRole !== 'guest') {
					this._registerUserReportTests(namePrefix + ' reports generation in info details page' +
						this.nameSuffix, urlValue);
				} else {
					this._registerGuestReportTests(namePrefix + ' report alerts in info details page' +
						this.nameSuffix, urlValue);
				}
			}
		},

		_registerUserReportTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: UserReportTests,
				properties: {
					urlValue: urlValue,
					reportButtonSelector: 'div.infoTitle div.right i.fa-print',
					detailsReport: true
				}
			});
		},

		_registerGuestReportTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: GuestReportTests,
				properties: {
					urlValue: urlValue,
					reportButtonSelector: 'div.infoTitle div.right i.fa-print'
				}
			});
		},

		_registerInfoTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DetailsInfo,
				properties: {
					urlValue: urlValue
				}
			});
		},

		_registerTabsTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DetailsTabs,
				properties: {
					urlValue: urlValue
				}
			});
		},

		_registerEditionLinkTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DetailsEditionLink,
				properties: {
					urlValue: urlValue
				}
			});
		}
	});
});
