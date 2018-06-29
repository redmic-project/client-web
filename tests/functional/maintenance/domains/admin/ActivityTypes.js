define([
	'../_Domain'
	, '../_DomainFacets'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFacets
	, _DomainFormEdition
) {

	var namePrefix = 'Activity type domain page',
		urlValue = '/domains-admin/activity-types',
		textSearchValue = 'Censos puntuales';

	new _Domain({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});

	new _DomainFacets({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue
	});

	new _DomainFormEdition({
		namePrefix: namePrefix,
		urlValue: urlValue
	});
});
