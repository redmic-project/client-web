define([
	'dojo/_base/declare'
	, 'tests/support/tests/_BaseCommons'
	, 'tests/support/tests/Atlas'
	, 'tests/support/tests/AtlasWithClickMap'
	, 'tests/support/Utils'
], function (
	declare
	, _BaseCommons
	, Atlas
	, AtlasWithClickMap
	, Utils
) {

	new declare(_BaseCommons, {

		constructor: function(args) {

			var suiteName = this.namePrefix + this.nameSuffix;

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: Atlas,
				properties: {
					textSearchValue: this.textSearchValue,
					suiteName: suiteName
				}
			});

			suiteName = this.namePrefix + ' with click map' + this.nameSuffix;

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: AtlasWithClickMap,
				properties: {
					textSearchValue: this.textSearchValue,
					suiteName: suiteName
				}
			});
		}
	})({
		namePrefix: 'Atlas page',
		urlValue: '/atlas',
		textSearchValue: 'toponimia_global'
	});
});
