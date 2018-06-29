define([
	'./_Administrative'
	, './_AdministrativeFacets'
], function (
	_Administrative
	, _AdministrativeFacetsTests
) {

	var namePrefix = 'Animal metadata page',
		urlValue = '/admin/animal',
		wizardEditionUrlValue = '/admin/animal-edit/22',
		wizardAdditionUrlValue = '/admin/animal-add/new',
		textSearchValue = 'Petra',
		configSteps = [{
			type: 'form',
			required: true
		},{
			type: 'formList'
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
