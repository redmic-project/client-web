define([
	'../_Domain'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFormEdition
) {

	var namePrefix = 'Canary protection domain page',
		urlValue = '/domains-taxon/canary-protection',
		textSearchValue = 'Vulnerable';

	new _Domain({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});

	new _DomainFormEdition({
		namePrefix: namePrefix,
		urlValue: urlValue
	});
});
