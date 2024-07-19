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

	var configSteps =  [{
			type: 'list',
			required: true
		},{
			type: 'form',
			required: true
		},{
			type: 'relationData',
			required: true,
			props: {
				fieldsByRelationData: [{
					columns: 'fechahora'
				},{
					columns: 'vflag'
				},{
					columns: 'qflag'
				},{
					type: 'geometry'
				},{
					type: 'filter',
					name: 'device'
				}]
			}
		}],
		configStepsByLoad = lang.clone(configSteps);

	configStepsByLoad.shift();

	new DataLoader({
		urlValue: '/data-loader/activity/1246/tracking',
		wizardAdditionUrlValue: '/data-loader/activity/1246/geo-data/add/new',
		wizardLoadUrlValue: '/data-loader/activity/1246/geo-data/load/2d8fb43f-c934-4be9-98f1-dfd5b2b1bbc8',
		namePrefix: 'Tracking data loader page',
		noAtlas: true,
		noAccessToEdition: true,
		configSteps: configSteps,
		configStepsByLoad: configStepsByLoad,


		valuesByInputModel: {
			'fileName': Config.env.cwd + '/tests/support/resources/fileForLoadData/pt.csv',
			'separator': ';'
		}
	});
});
