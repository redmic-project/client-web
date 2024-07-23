define([
	'app/designs/base/_Main'
	, 'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/components/PDFViewer/PDFViewer'
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, PDFViewer
) {

	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Vista detalle de documento PDF.

		constructor: function(args) {

			this.target = redmicConfig.services.document;

			this.config = {
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				pdf: {
					width: 6,
					height: 6,
					type: PDFViewer,
					props: {
						classWindowContent: 'view',
						title: 'PDF'
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_refreshModules: function() {

			this._checkPathVariableId();

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
				pdfUrl = redmicConfig.getServiceUrl(pdfUrlProto),
				widgetInstance = this._getWidgetInstance('pdf');

			var callback = lang.hitch(this, this._loadPdfInWidget, pdfUrl);

			if (!widgetInstance) {
				this._onceEvt('LAYOUT_COMPLETE', callback);
			} else {
				callback();
			}
		},

		_loadPdfInWidget: function(pdfUrl) {

			var widgetInstance = this._getWidgetInstance('pdf');

			if (!widgetInstance) {
				return;
			}

			this._publish(widgetInstance.getChannel('LOAD_PDF'), {
				url: pdfUrl
			});
		}
	});
});
