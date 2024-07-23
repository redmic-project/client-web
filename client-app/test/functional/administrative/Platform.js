define([
	'./_Administrative'
	, './_AdministrativeFacets'
	, './_AdministrativeLinks'
], function (
	_AdministrativeTests
	, _AdministrativeFacetsTests
	, _AdministrativeLinksTests
) {

	var namePrefix = 'Platform metadata page',
		urlValue = '/admin/platform',
		wizardEditionUrlValue = '/admin/platform-edit/14',
		wizardAdditionUrlValue = '/admin/platform-add/new',
		textSearchValue = 'Demonio de Tasmania',
		configSteps = [{
			type: 'form',
			required: true
		},{
			type: 'formList'
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
});
