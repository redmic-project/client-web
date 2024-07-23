define([
	'./_DetailsInfo'
	, './_DetailsMap'
], function (
	_DetailsInfo
	, _DetailsMap
) {

	var namePrefix = 'Species';

	new _DetailsInfo({
		namePrefix: namePrefix,
		urlValue: '/admin/species-info/5046',
		tabs: true,
		editionLink: true
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' locations',
		urlValue: '/admin/species-location/5046'
	});
});
