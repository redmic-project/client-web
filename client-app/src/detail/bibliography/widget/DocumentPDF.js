define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, 'src/component/components/PDFViewer/PDFViewer'
], function(
	declare
	, lang
	, _Module
	, _Show
	, _Store
	, redmicConfig
	, PDFViewer
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Widget para mostrar un lector de documentos PDF incrustado.

		constructor: function(args) {

			this.config = {
				ownChannel: 'documentPDF',
				target: redmicConfig.services.document
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_initialize: function() {

			this._pdfViewer = new PDFViewer({
				parentChannel: this.getChannel()
			});
		},

		getNodeToShow: function() {

			return this._pdfViewer.getNodeToShow();
		},

		_onMeOrAncestorShown: function() {

			this._refreshCurrentData();
		},

		_refreshCurrentData: function() {

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(item) {

			var documentData = item.data,
				documentInternalUrl = documentData.internalUrl;

			if (!documentInternalUrl) {
				return;
			}

			var pdfUrlProto = documentInternalUrl.replace('/api', redmicConfig.apiUrlVariable),
				pdfUrl = redmicConfig.getServiceUrl(pdfUrlProto);

			this._loadPdf(pdfUrl);
		},

		_loadPdf: function(pdfUrl) {

			this._publish(this._pdfViewer.getChannel('LOAD_PDF'), {
				url: pdfUrl
			});
		}
	});
});
