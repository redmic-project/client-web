define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddBasicTitle"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/components/PDFViewer/PDFViewer"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/WhatIsRedmicLongTermChallenge"
	//, "templates/WhatIsRedmicSystemArchitecture"
	, "templates/WhatIsRedmicInfoType"
	, "templates/WhatIsRedmicUserType"
	, "templates/WhatIsRedmicDataPolicy"
	, "templates/WhatIsRedmicProductsAndServices"
	//, "templates/WhatIsRedmicInteroperability"
], function(
	Controller
	, Layout
	, _AddBasicTitle
	, declare
	, lang
	, PDFViewer
	, TabsDisplayer
	, TemplateDisplayer
	, TemplateWhatIsRedmicLongTermChallenge
	//, TemplateWhatIsRedmicSystemArchitecture
	, TemplateWhatIsRedmicInfoType
	, TemplateWhatIsRedmicUserType
	, TemplateWhatIsRedmicDataPolicy
	, TemplateWhatIsRedmicProductsAndServices
	//, TemplateWhatIsRedmicInteroperability
){
	return declare([Layout, Controller, _AddBasicTitle], {
		//	summary:
		//		Vista detalle de explicación redmic.

		constructor: function(args) {

			this.config = {
				noScroll: true,
				propsWidget: {
					noCloseWindow: true,
					noButtonsWindow: true,
					noTitleWindow: true
				},
				title: this.i18n.whatIsRedmic
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.widgetConfigs = this._merge([{
				additionalInfo: {
					width: 6,
					height: 6,
					type: TabsDisplayer,
					props: {
						title: ' ',
						childTabs: [{
							type: TemplateDisplayer,
							title: this.i18n.longTermChallenge,
							props: {
								template: TemplateWhatIsRedmicLongTermChallenge
							}
						},{
							title: this.i18n.logicalDataModel,
							type: PDFViewer,
							props: {
								urlPdf: '/resources/documents/ModeloLogico.pdf',
								roleGuestActive: true
							}
						}/*,{
							type: TemplateDisplayer,
							title: this.i18n.systemArchitecture,
							props: {
								template: TemplateWhatIsRedmicSystemArchitecture
							}
						}*/,{
							type: TemplateDisplayer,
							title: this.i18n.infoType,
							props: {
								template: TemplateWhatIsRedmicInfoType
							}
						},{
							type: TemplateDisplayer,
							title: this.i18n.userType,
							props: {
								template: TemplateWhatIsRedmicUserType
							}
						},{
							type: TemplateDisplayer,
							title: this.i18n.dataPolicy,
							props: {
								template: TemplateWhatIsRedmicDataPolicy
							}
						},{
							type: TemplateDisplayer,
							title: this.i18n.productsAndServices,
							props: {
								template: TemplateWhatIsRedmicProductsAndServices
							}
						}/*,{
							type: TemplateDisplayer,
							title: this.i18n.interoperability,
							props: {
								template: TemplateWhatIsRedmicInteroperability
							}
						}*/]
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_putMetaTags: function() {

			if (this.metaTags) {
				this._emitEvt('PUT_META_TAGS', {
					view: this.ownChannel
				});
			}
		}
	});
});
