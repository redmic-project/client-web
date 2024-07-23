define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/PlatformList"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, templateList
	, _Select
	, SelectionBox
	, Order
	, Total
){
	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Extensión para establecer la configuración de las vistas de platform.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				browserExts: [_Select],
				target: redmicConfig.services.platform,
				title: this.i18n.platforms
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Order,
					config: 'orderConfig'
				}],
				orderConfig: {
					options: [
						{value: "name"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.platform
			}, this.facetsConfig || {}]);
		}
	});
});
