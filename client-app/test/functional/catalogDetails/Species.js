define([
	'test/functional/administrativeDetails/_DetailsInfo'
	, 'test/functional/administrativeDetails/_DetailsMap'
], function (
	_DetailsInfo
	, _DetailsMap
) {

	var namePrefix = 'Species catalog';

	new _DetailsInfo({
		namePrefix: namePrefix,
		urlValue: '/catalog/species-info/5046'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' locations',
		urlValue: '/catalog/species-location/5046'
	});
});
