define([
	'tests/functional/administrativeDetails/_DetailsInfo'
	, 'tests/functional/administrativeDetails/_DetailsMap'
], function (
	_DetailsInfo
	, _DetailsMap
) {

	var namePrefix = 'Activity catalog';

	new _DetailsInfo({
		namePrefix: namePrefix,
		urlValue: '/catalog/activity-info/108',
		tabs: true,
		reports: true
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' citations',
		urlValue: '/catalog/activity-map/108'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' area',
		urlValue: '/catalog/activity-area/1152'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' tracking',
		urlValue: '/catalog/activity-tracking/789'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' infrastructure',
		urlValue: '/catalog/activity-infrastructure/1378'
	});
});
