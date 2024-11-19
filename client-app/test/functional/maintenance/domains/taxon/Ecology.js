define([
	'../_Domain'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFormEdition
) {

	var namePrefix = 'Ecology domain page',
		urlValue = '/domains-taxon/ecology',
		textSearchValue = 'Demersal';

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
