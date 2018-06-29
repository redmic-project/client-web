define([
	'../_Domain'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFormEdition
) {

	var namePrefix = 'EU protection domain page',
		urlValue = '/domains-taxon/eu-protection',
		textSearchValue = 'Directiva Hábitat (Anexo II+IV)';

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
