define([
	'dojo/_base/declare'
	, './_DetailsBase'
	, 'test/support/tests/DetailsPDF'
], function(
	declare
	, _DetailsBase
	, DetailsPDF
) {

	return declare(_DetailsBase, {

		_registerOtherTests: function(namePrefix, urlValue) {

			this._registerPDFTests(namePrefix + ' visor details page' + this.nameSuffix, urlValue);
		},

		_registerPDFTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DetailsPDF,
				properties: {
					urlValue: urlValue
				}
			});
		}
	});
});
