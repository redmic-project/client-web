define([
	'./_Administrative'
	, './_AdministrativeFacets'
	, './_AdministrativeLinks'
	, './_AdministrativeFilter'
], function (
	_AdministrativeTests
	, _AdministrativeFacetsTests
	, _AdministrativeLinksTests
	, _AdministrativeFilterTests
) {

	var namePrefix = 'Activity metadata page',
		urlValue = '/admin/activity',
		wizardEditionUrlValue = '/admin/activity-edit/56',
		wizardAdditionUrlValue = '/admin/activity-add/new',
		textSearchValue = 'Datos meteorológicos registrados por la boya de Granadilla',
		configSteps = [{
			type: 'list',
			required: true,
			noEditable: true
		},{
			type: 'form',
			required: true
		},{
			type: 'formList'
		},{
			type: 'formList'
		},{
			type: 'formList'
		},{
			type: 'doubleList'
		}];

	new _AdministrativeTests({
		namePrefix,
		urlValue,
		wizardEditionUrlValue,
		wizardAdditionUrlValue,
		textSearchValue,
		configSteps
	});

	new _AdministrativeFacetsTests({
		namePrefix,
		urlValue
	});

	new _AdministrativeLinksTests({
		namePrefix,
		urlValue
	});

	new _AdministrativeFilterTests({
		namePrefix,
		urlValue
	});
});
