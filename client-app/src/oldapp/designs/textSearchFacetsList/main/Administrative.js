define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/browser/_Select"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/browser/bars/Order"
	, "src/component/browser/bars/Total"
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _Select
	, SelectionBox
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
				browserExts: [_Select],
				services: redmicConfig.services
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Order,
					config: 'orderConfig'
				}]
			}, this.browserConfig || {}]);
		}
	});
});
