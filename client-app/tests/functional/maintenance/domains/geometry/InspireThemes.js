define([
	'../_Domain'
	, '../_DomainFormEdition'
], function (
	_Domain
	, _DomainFormEdition
) {

	var namePrefix = 'Inspire theme domain page',
		urlValue = '/domains-geometry/inspire-themes',
		textSearchValue = 'Zonas de riesgos naturales',
		newOrderingValue = 'code';

	new _Domain({
		namePrefix: namePrefix,
		urlValue: urlValue,
		textSearchValue: textSearchValue,
		newOrderingValue: newOrderingValue
	});

	new _DomainFormEdition({
		namePrefix: namePrefix,
		urlValue: urlValue
	});
});
