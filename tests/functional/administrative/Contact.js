define([
	'./_Administrative'
	, './_AdministrativeFacets'
	, './_AdministrativeLinks'
], function (
	_AdministrativeTests
	, _AdministrativeFacetsTests
	, _AdministrativeLinksTests
) {

	var namePrefix = 'Contact metadata page',
		urlValue = '/admin/contact',
		wizardEditionUrlValue = '/admin/contact-edit/14',
		wizardAdditionUrlValue = '/admin/contact-add/new',
		textSearchValue = 'Sevilla Hernández',
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
