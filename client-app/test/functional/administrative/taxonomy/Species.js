define([
	'test/support/tests/ListFilterByTree'
	, 'test/support/Utils'
	, 'test/support/tests/Dashboard'
	, 'test/support/tests/WizardWorms'
	, '../_Administrative'
	, '../_AdministrativeFacets'
	, '../_AdministrativeLinks'
	, '../_AdministrativeFilter'
], function (
	ListFilterByTree
	, Utils
	, DashboardTests
	, WizardWorms
	, _AdministrativeTests
	, _AdministrativeFacetsTests
	, _AdministrativeLinksTests
	, _AdministrativeFilterTests
) {

	var namePrefix = 'Species metadata page',
		urlValue = '/taxon/species',
		wizardEditionUrlValue = '/admin/species-edit/5046',
		wizardAdditionUrlValue = '/admin/species-add/new',
		textSearchValue = 'Sapphirina auronitens Claus',
		configSteps = [{
			type: 'form',
			required: true
		},{
			type: 'form'
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

	/*new _AdministrativeFilterTests({
		namePrefix,
		urlValue
	});*/

	var nameSuffix = 'tests';

	Utils.registerTests({
		suiteName: namePrefix + ' dashboard as registered user ' + nameSuffix,
		definition: DashboardTests,
		properties: {
			sidebarPrimaryValue: 'admin',
			sidebarSecondaryValue: '/admin/taxonomy',
			urlValue: urlValue
		}
	});

	Utils.registerTests({
		suiteName: namePrefix + ' tree filter as registered user ' + nameSuffix,
		definition: ListFilterByTree,
		properties: {
			urlValue: urlValue
		}
	});

	Utils.registerTests({
		suiteName: namePrefix + ' wizard addition worms as registered user ' + nameSuffix,
		definition: WizardWorms,
		properties: {
			urlValue: wizardAdditionUrlValue
		}
	});
});
