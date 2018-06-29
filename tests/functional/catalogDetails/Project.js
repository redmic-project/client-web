define([
	'tests/functional/administrativeDetails/_DetailsInfo'
], function (
	_DetailsInfo
) {

	new _DetailsInfo({
		namePrefix: 'Project catalog',
		urlValue: '/catalog/project-info/19',
		reports: true
	});
});
