define([
	'dojo/_base/declare'
	, './_DetailsBase'
	, 'tests/support/tests/Map'
], function(
	declare
	, _DetailsBase
	, MapTests
) {

	return declare(_DetailsBase, {

		_registerOtherTests: function(namePrefix, urlValue) {

			this._registerMapTests(namePrefix + ' map details page' + this.nameSuffix, urlValue);
		},

		_registerMapTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: MapTests,
				properties: {
					urlValue: urlValue
				}
			});
		}
	});
});
