define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/tests/_DataLoader'
], function(
	declare
	, lang
	, DataLoader
) {

	new DataLoader({
		urlValue: '/data-loader/activity/519/infrastructure',
		wizardAdditionUrlValue: '/data-loader/activity/519/geo-data/add/new',
		wizardEditionUrlValue: '/data-loader/activity/519/geo-data/edit/46d7d04f-985b-47f0-8b9e-cfe27ce145b3',
		textSearchValue: 'Boya ODAS',
		namePrefix: 'Infrastructure data loader page',
		configSteps: [{
			type: 'form',
			required: true
		},{
			type: 'pointGeometry',
			required: true
		}],

		valuesByInputModel: {
			'properties/url': 'https://redmic.es'
		}
	});
});
