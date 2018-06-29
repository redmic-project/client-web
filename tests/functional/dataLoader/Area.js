define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/tests/_DataLoader'
	, 'tests/support/Config'
], function(
	declare
	, lang
	, DataLoader
	, Config
) {

	new DataLoader({
		urlValue: '/data-loader/activity/522/area',
		wizardEditionUrlValue: '/data-loader/activity/1143/geo-data/edit/b7df3428-5d0c-4975-bce5-94a937381a87',
		wizardLoadUrlValue: '/data-loader/activity/1143/geo-data/add/new',
		textSearchValue: 'Mencáfete',
		namePrefix: 'Area data loader page',


		configSteps: [{
			type: 'form',
			required: true
		},{
			type: 'formList'
		}],


		valuesByInputModel: {
			'fileName': Config.env.cwd + '/tests/support/resources/fileForLoadData/ar.zip'
		},
		configStepsByLoad: [{
			type: 'form',
			required: true
		},{
			type: 'relationData',
			required: true,
			props: {
				fieldsByRelationData: [{
					columns: 'SITE_CODE'
				},{
					type: 'filter',
					name: 'areaType'
				},{
					columns: 'SITE_NAME'
				}]
			}
		}]
	});
});
