define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddBasicTitle"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "app/base/views/_ViewListBase"
], function(
	Controller
	, Layout
	, _AddBasicTitle
	, declare
	, lang
	, _ViewListBase
){
	return declare([Layout, Controller, _AddBasicTitle], {
		//	summary:
		//		Menú para mostrar las diferentes vistas de taxonomía

		constructor: function(args) {

			this.config = {
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				},
				title: this.i18n.taxonomy
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.widgetConfigs = this._merge([{
				taxonomy: {
					width: 6,
					height: 6,
					type: _ViewListBase,
					props: {
						title: ' ',
						"class": "containerDetails",
						items: {
							catergoryId: 49,
							modules: []
						}
					}
				}
			}, this.widgetConfigs || {}]);
		}
	});
});
