define([
	'dojo/_base/declare'
	, 'test/support/tests/_BaseCommons'
	, 'test/support/tests/DetailsBase'
], function(
	declare
	, _BaseCommons
	, DetailsBase
) {

	return declare(_BaseCommons, {

		constructor: function(args) {

			var namePrefix = args.namePrefix + ' base details page' + this.nameSuffix;

			this._registerBaseTests(
				namePrefix,
				this.urlValue
			);

			this._registerOtherTests && this._registerOtherTests(args.namePrefix, this.urlValue);
		},

		_registerBaseTests: function(suiteName, urlValue) {

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: DetailsBase,
				properties: {
					urlValue: urlValue
				}
			});
		}
	});
});
