define([
	'./_DetailsInfo'
	, './_DetailsMap'
], function (
	_DetailsInfo
	, _DetailsMap
) {

	var namePrefix = 'Activity';

	new _DetailsInfo({
		namePrefix: namePrefix,
		urlValue: '/admin/activity-info/108',
		tabs: true,
		editionLink: true
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' citations',
		urlValue: '/admin/activity-map/108'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' area',
		urlValue: '/admin/activity-area/1143'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' tracking',
		urlValue: '/admin/activity-tracking/789'
	});

	new _DetailsMap({
		namePrefix: namePrefix + ' infrastructure',
		urlValue: '/admin/activity-infrastructure/1378'
	});
});
