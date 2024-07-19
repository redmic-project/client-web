define([
	'../_Domain'
	, '../_DomainFormEdition'
	, '../_DomainHierarchical'
], function (
	_Domain
	, _DomainFormEdition
	, _DomainHierarchical
) {

	var namePrefix = 'Line type domain page',
		urlValue = '/domains-geometry/line-types',
		newOrderingValue = 'name';
		textSearchValue = 'Isobata';

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
