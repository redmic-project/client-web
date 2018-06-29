define([
	'./_Administrative'
	, './_AdministrativeFacets'
	, './_AdministrativeLinks'
], function (
	_AdministrativeTests
	, _AdministrativeFacetsTests
	, _AdministrativeLinksTests
) {

	var namePrefix = 'Organisation metadata page',
		urlValue = '/admin/organisation',
		wizardEditionUrlValue = '/admin/organisation-edit/14',
		wizardAdditionUrlValue = '/admin/organisation-add/new',
		textSearchValue = 'Observatorio Ambiental Granadilla',
		configSteps = [{
			type: 'form',
			required: true
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
