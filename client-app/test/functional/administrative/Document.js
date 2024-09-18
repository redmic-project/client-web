define([
	'./_Administrative'
	, './_AdministrativeFacets'
	, './_AdministrativeLinks'
	, 'test/support/tests/WizardAddition'
	, 'test/support/Utils'
	, 'test/support/Config'
], function (
	_AdministrativeTests
	, _AdministrativeFacetsTests
	, _AdministrativeLinksTests
	, WizardAdditionTests
	, Utils
	, Config
) {

	var namePrefix = 'Document metadata page',
		urlValue = '/admin/document',
		textSearchValue = 'Die Hornkorallen (Gorgonaria) der Kanarischen Region',
		wizardEditionUrlValue = '/admin/document-edit/6326',
		wizardAdditionUrlValue = '/admin/document-add/new',
		wizardLoadUrlValue = '/admin/document/load',
		newOrderingValue = 'year',
		configSteps = [{
			type: 'form',
			required: true
		}],
		valuesByInputModel = {
			language: 'es',
			'fileName': Config.env.cwd + '/client-app/test/support/resources/fileForLoadData/document.csv',
			'url': Config.env.cwd + '/client-app/test/support/resources/doc.pdf',
			'separator': '|'
		},
		configStepsByLoad = [{
			type: 'form',
			required: true
		},{
			type: 'relationData',
			required: true,
			props: {
				fieldsByRelationData: [true,true,true,true,true,true,true,true,true,true]
			}
		}];

	new _AdministrativeTests({
		namePrefix,
		urlValue,
		wizardEditionUrlValue,
		wizardAdditionUrlValue,
		textSearchValue,
		configSteps,
		newOrderingValue,
		valuesByInputModel: valuesByInputModel
	});

	new _AdministrativeFacetsTests({
		namePrefix,
		urlValue
	});

	new _AdministrativeLinksTests({
		namePrefix,
		urlValue
	});

	Utils.registerTests({
		suiteName: 'Load data test in ' + namePrefix + ' tests',
		definition: WizardAdditionTests,
		properties: {
			urlValue: wizardLoadUrlValue,
			configSteps: configStepsByLoad,
			valuesByInputModel: valuesByInputModel
		}
	});
});
