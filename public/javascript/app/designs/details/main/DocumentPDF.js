define([
	'app/designs/base/_Main'
	, 'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/components/PDFViewer/PDFViewer'
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

			var pdfUrl = item.data.url,
				widgetInstance = this._getWidgetInstance('pdf');

			if (!pdfUrl || !widgetInstance) {
				return;
			}

			this._publish(widgetInstance.getChannel('LOAD_PDF'), {
				url: pdfUrl
			});
		}
	});
});
