define([
	'../_Domain'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFormEdition
) {

	var namePrefix = 'Parameter type domain page',
		urlValue = '/domains-observations/parameter-types',
		textSearchValue = 'Tiempo';

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
