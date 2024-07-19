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
		urlValue: '/data-loader/activity/1152/area',
		wizardEditionUrlValue: '/data-loader/activity/1152/geo-data/edit/78883b11-e89d-44f9-aece-d86763882358',
		wizardLoadUrlValue: '/data-loader/activity/1152/geo-data/add/new',
		textSearchValue: 'Aguas interiores',
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
