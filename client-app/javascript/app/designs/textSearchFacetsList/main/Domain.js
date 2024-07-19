define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, Order
	, Total
){
	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Extensión para establecer la configuración de las vistas de dominios con facets.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				services: redmicConfig.services
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				bars: [{
					instance: Total
				},{
					instance: Order,
					config: 'orderConfig'
				}]
			}, this.browserConfig || {}]);
		}
	});
});
