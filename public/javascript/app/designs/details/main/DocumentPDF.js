define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/components/PDFViewer/PDFViewer"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, PDFViewer
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection], {
		//	summary:
		//		Vista detalle de Document.

		constructor: function(args) {

			this.target = redmicConfig.services.document;
			this.config = {
				noScroll: true,
				propsWidget: {
					noButtonsWindow: true,
					noTitleWindow: true
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
						classWindowContent: "view",
						title: "PDF"
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

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

			if (item.data.url)
				this._publish(this._widgets.pdf.getChannel("LOAD_PDF"), {
					url: item.data.url
				});
			else
				this._goTo404();
		}
	});
});