define([
	'../_Domain'
	, '../_DomainFacets'
	, '../_DomainWizardEdition'
], function (
	_Domain
	, _DomainFacets
	, _DomainWizardEdition
) {

	var namePrefix = 'Parameter domain page',
		urlValue = '/domains-observations/parameters',
		textSearchValue = 'Materia en suspensión',

		additionUrlValue = '/admin/parameter-add/new',
		editionUrlValue = '/admin/parameter-edit/14',
		configSteps = [{
			type: 'list',
			required: true,
			noEditable: true
		},{
			type: 'form',
			required: true
		},{
			type: 'doubleList',
			required: true
		}];

	new _Domain({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});

	new _DomainWizardEdition({
		namePrefix: namePrefix,
		urlValue: urlValue,
		additionUrlValue: additionUrlValue,
		editionUrlValue: editionUrlValue,
		configSteps: configSteps
	});

	new _DomainFacets({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});
});
