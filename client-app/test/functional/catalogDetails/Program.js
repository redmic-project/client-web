define([
	'test/functional/administrativeDetails/_DetailsInfo'
], function (
	_DetailsInfo
) {

	new _DetailsInfo({
		namePrefix: 'Program catalog',
		urlValue: '/catalog/program-info/10',
		reports: true
	});
});
