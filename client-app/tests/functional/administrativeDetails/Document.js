define([
	'./_DetailsInfo'
	, './_DetailsPDF'
], function (
	_DetailsInfo
	, _DetailsPDF
) {

	new _DetailsInfo({
		namePrefix: 'Document',
		urlValue: '/admin/document-info/4916',
		tabs: true,
		editionLink: true
	});

	new _DetailsPDF({
		namePrefix: 'Document PDF',
		urlValue: '/admin/document-pdf/4916'
	});
});
