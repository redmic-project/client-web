define([
	'./_Administrative'
	, './_AdministrativeFacets'
], function (
	_Administrative
	, _AdministrativeFacetsTests
) {

	var namePrefix = 'Device metadata page',
		urlValue = '/admin/device',
		wizardEditionUrlValue = '/admin/device-edit/2',
		wizardAdditionUrlValue = '/admin/device-add/new',
		textSearchValue = 'Terminal de localización satelital en tiempo real',
		configSteps = [{
			type: 'list',
			required: true,
			noEditable: true
		},{
			type: 'form',
			required: true
		},{
			type: 'formList'
		}];

	new _Administrative({
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
});
