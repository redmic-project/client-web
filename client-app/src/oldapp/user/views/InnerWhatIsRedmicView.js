define([
	'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'app/designs/details/_AddBasicTitle'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/components/PDFViewer/PDFViewer'
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'templates/WhatIsRedmicLongTermChallenge'
	, 'templates/WhatIsRedmicInfoType'
	, 'templates/WhatIsRedmicUserType'
	, 'templates/WhatIsRedmicDataPolicy'
	, 'templates/WhatIsRedmicProductsAndServices'
	, 'templates/WhatIsRedmicInteroperability'
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
	, TemplateWhatIsRedmicInfoType
	, TemplateWhatIsRedmicUserType
	, TemplateWhatIsRedmicDataPolicy
	, TemplateWhatIsRedmicProductsAndServices
	, TemplateWhatIsRedmicInteroperability
) {

	return declare([Layout, Controller, _AddBasicTitle], {
		//	summary:
		//		Vista detalle de explicación redmic.

		constructor: function(args) {

			this.config = {
				title: this.i18n.whatIsRedmic,

				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				},

				_childTabs: [{
					type: TemplateDisplayer,
					title: this.i18n.longTermChallenge,
					props: {
						template: TemplateWhatIsRedmicLongTermChallenge
					}
				},{
					title: this.i18n.logicalDataModel,
					type: PDFViewer,
					props: {
						urlPdf: '/res/documents/ModeloLogico.pdf',
						roleGuestActive: true
					}
				},{
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
				},{
					type: TemplateDisplayer,
					title: this.i18n.interoperability,
					props: {
						template: TemplateWhatIsRedmicInteroperability
					}
				}]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.widgetConfigs = this._merge([{
				additionalInfo: {
					width: 6,
					height: 6,
					type: TabsDisplayer
				}
			}, this.widgetConfigs || {}]);
		},

		_afterShow: function() {

			for (var i = 0; i < this._childTabs.length; i++) {
				this._addChildTab(this._childTabs[i]);
			}
		},

		_addChildTab: function(childTabConfig) {

			var title = childTabConfig.title,
				childTabInstance = this._createChildInstance(childTabConfig);

			var tabsDisplayerInstance = this._getWidgetInstance('additionalInfo');

			this._publish(tabsDisplayerInstance.getChannel('ADD_TAB'), {
				title: title,
				channel: childTabInstance.getChannel()
			});
		},

		_createChildInstance: function(config) {

			var type = config.type,
				props = config.props;

			props.parentChannel = this.getChannel();

			return new type(props);
		},

		_putMetaTags: function() {
			// TODO esto es necesario porque se trata de una vista detalle, que define el método original,
			// pero no interesa en este caso. Pisando nuevamente el método, se comporta como define _View.
			// Revisar el proceso de rellenar metatags

			this._putDefaultMetaTags();
		}
	});
});
