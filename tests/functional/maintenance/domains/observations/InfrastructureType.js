define([
	'../_Domain'
	, '../_DomainFormEdition'
	, '../_DomainHierarchical'
], function (
	_Domain
	, _DomainFormEdition
	, _DomainHierarchical
) {

	var namePrefix = 'Infrastructure type domain page',
		urlValue = '/domains-observations/infrastructure-type',
		textSearchValue = 'Faro';

	new _Domain({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});

	new _DomainFormEdition({
		namePrefix: namePrefix,
		urlValue: urlValue
	});

	new _DomainHierarchical({
		namePrefix: namePrefix,
		urlValue: urlValue
	});
});
