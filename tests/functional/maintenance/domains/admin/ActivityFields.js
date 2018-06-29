define([
	'../_Domain'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFormEdition
) {

	var namePrefix = 'Activity field domain page',
		urlValue = '/domains-admin/activity-fields',
		textSearchValue = 'Hidrología - Clima';

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
