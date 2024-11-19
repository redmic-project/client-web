define([
	'dojo/_base/declare'
	, 'test/support/tests/_BaseCommons'
	, 'test/support/tests/SpeciesDistribution'
	, 'test/support/Utils'
], function (
	declare
	, _BaseCommons
	, SpeciesDistribution
	, Utils
) {

	new declare(_BaseCommons, {

		constructor: function(args) {

			var suiteName = this.namePrefix + this.nameSuffix;

			this._mixPropsAndRegisterTests({
				suiteName: suiteName,
				definition: SpeciesDistribution,
				properties: {
					listIntabs: true,
					textSearchValue: this.textSearchValue,
					suiteName: suiteName
				}
			});
		}
	})({
		namePrefix: 'Species distribution page ',
		urlValue: '/viewer/species-distribution',
		textSearchValue: 'Acartia (Acartia) negligens'
	});
});
