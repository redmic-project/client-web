define([
	'tests/functional/administrativeDetails/_DetailsInfo'
	, 'tests/functional/administrativeDetails/_DetailsPDF'
], function (
	_DetailsInfo
	, _DetailsPDF
) {
	var namePrefix = 'Bibliography catalog';

	new _DetailsInfo({
		namePrefix: namePrefix,
		urlValue: '/bibliography/document-info/4916',
		tabs: true,
		reports: true
	});

	new _DetailsPDF({
		namePrefix: namePrefix + ' PDF',
		urlValue: '/bibliography/document-pdf/4916'
	});
});
