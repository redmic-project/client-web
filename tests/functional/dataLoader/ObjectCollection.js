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
		urlValue: '/data-loader/activity/1195/object-collection',
		wizardAdditionUrlValue: '/data-loader/activity/1195/geo-data/add/new',
		wizardEditionUrlValue: '/data-loader/activity/1195/geo-data/edit/eabd8837-ea83-4d10-b398-a7734e061b66',
		wizardLoadUrlValue: '/data-loader/activity/1195/geo-data/load/eabd8837-ea83-4d10-b398-a7734e061b66',
		textSearchValue: 'Playa de Janubio',
		namePrefix: 'Object collection data loader page',


		configSteps: [{
			type: 'form',
			required: true
		},{
			type: 'lineGeometry',
			required: true
		},{
			type: 'formList',
			required: true
		}],

		valuesByInputModel: {
			'geometry/coordinates': '[[-16.602745056152344,28.393980721011758],[-16.60208523273468,28.39444206096232]]',
			'fileName': Config.env.cwd + '/tests/support/resources/fileForLoadData/oc.csv',
			'separator': ';'
		},

		configStepsByLoad: [{
			type: 'form',
			required: true
		},{
			type: 'list',
			props: {
				itemToSelect: 'Desecho'
			},
			required: true
		},{
			type: 'list',
			required: true,
			props: {
				itemToSelect: 'Basura - Origen'
			}
		},{
			type: 'relationData',
			required: true,
			props: {
				fieldsByRelationData: [{
					columns: 'auto'
				},{
					columns: 'auto',
					type: 'classifications'
				},{
					field: 'Parámetro *',
					type: 'select',
					name: 'dataDefinitionId'
				}]
			}
		}]
	});
});
