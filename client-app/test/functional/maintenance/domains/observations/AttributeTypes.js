define([
	'../_Domain'
	, '../_DomainFormEdition'
	, '../_DomainHierarchical'
], function (
	_Domain
	, _DomainFormEdition
	, _DomainHierarchical
) {

	var namePrefix = 'Attribute type domain page',
		urlValue = '/domains-observations/attribute-types',
		textSearchValue = 'Color';

	new _Domain({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});

	new _DomainHierarchical({
		namePrefix: namePrefix,
		urlValue: urlValue
	});

	new _DomainFormEdition({
		namePrefix: namePrefix,
		urlValue: urlValue
	});
});
