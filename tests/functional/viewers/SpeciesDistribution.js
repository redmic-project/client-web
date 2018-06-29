define([
	'dojo/_base/declare'
	, 'tests/support/tests/_BaseCommons'
	, 'tests/support/tests/SpeciesDistribution'
	, 'tests/support/Utils'
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
