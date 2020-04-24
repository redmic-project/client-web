define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddBasicTitle"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/UserTermsAndConditions"
], function(
	Controller
	, Layout
	, _AddBasicTitle
	, declare
	, lang
	, TemplateDisplayer
	, Template
){
	return declare([Layout, Controller, _AddBasicTitle], {
		//	summary:
		//		Vista detalle de terminos y condiciones para dentro de redmic.

		constructor: function(args) {

			this.config = {
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				},
				title: this.i18n.termCondition
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.widgetConfigs = this._merge([{
				termsAndConditions: {
					width: 6,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: ' ',
						template: Template,
						"class": "mediumSolidContainer.borderRadiusBottom"
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_putMetaTags: function() {
			// TODO esto es necesario porque se trata de una vista detalle, que define el método original,
			// pero no interesa en este caso. Pisando nuevamente el método, se comporta como define _View.
			// Revisar el proceso de rellenar metatags

			this._putDefaultMetaTags();
		}
	});
});
