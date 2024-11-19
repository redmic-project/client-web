define([
	'../_Domain'
	, '../_DomainFacets'
	, '../_DomainWizardEdition'
], function (
	_Domain
	, _DomainFacets
	, _DomainWizardEdition
) {

	var namePrefix = 'Metrics definition domain page',
		urlValue = '/domains-observations/metrics-definitions',
		textSearchValue = 'TODO',

		additionUrlValue = '/admin/metrics-definition-add/new',
		editionUrlValue = '/admin/metrics-definition-edit/TODO',
		configSteps = [{
			type: 'list',
			required: true,
			noEditable: true
		},{
			type: 'list',
			required: true,
			noEditable: true
		},{
			type: 'form',
			required: true
		}];

	/*new _Domain({
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
	});*/
});
