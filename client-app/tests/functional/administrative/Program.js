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

	var namePrefix = 'Program metadata page',
		urlValue = '/admin/program',
		wizardEditionUrlValue = '/admin/program-edit/10',
		wizardAdditionUrlValue = '/admin/program-add/new',
		textSearchValue = 'Red europea NATURA 2000',
		configSteps = [{
			type: 'form',
			required: true
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
