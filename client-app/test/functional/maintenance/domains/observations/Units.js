define([
	'../_Domain'
	, '../_DomainFacets'
	, '../_DomainWizardEdition'
], function (
	_Domain
	, _DomainFacets
	, _DomainWizardEdition
) {

	var namePrefix = 'Unit domain page',
		urlValue = '/domains-observations/units',
		textSearchValue = 'Micromoles por litro',

		additionUrlValue = '/admin/unit-add/new',
		editionUrlValue = '/admin/unit-edit/19',
		configSteps = [{
			type: 'list',
			required: true,
			noEditable: true
		},{
			type: 'form',
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
