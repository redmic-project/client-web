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
		urlValue: '/data-loader/activity/1284/survey-station',
		wizardAdditionUrlValue: '/data-loader/activity/1284/geo-data/add/new',
		wizardEditionUrlValue: '/data-loader/activity/1284/geo-data/edit/27bad38e-ee75-4fdc-82c9-dfe3d421e677',
		wizardLoadUrlValue: '/data-loader/activity/1284/geo-data/load/27bad38e-ee75-4fdc-82c9-dfe3d421e677',
		textSearchValue: 'Boya de Granadila',
		namePrefix: 'Survey station data loader page',


		configSteps: [{
			type: 'form',
			required: true
		},{
			type: 'pointGeometry',
			required: true
		},{
			type: 'formList',
			required: true
		}],


		valuesByInputModel: {
			'fileName': Config.env.cwd + '/tests/support/resources/fileForLoadData/ft.csv',
			'separator': ';'
		},
		configStepsByLoad: [{
			type: 'form',
			required: true
		},{
			type: 'relationData',
			required: true,
			props: {
				fieldsByRelationData: [{
					auto: true
				},{
					auto: true
				},{
					auto: true
				},{
					auto: true
				},{
					columns: 'value',
					type: 'select',
					name: 'dataDefinitionId'
				}]
			}
		}]
	});
});
