define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Total'
	, 'templates/DeviceList'
], function(
	_Main
	, TextSearchFacetsListController
	, TextSearchFacetsListLayout
	, redmicConfig
	, declare
	, lang
	, _Select
	, Order
	, SelectionBox
	, Total
	, DeviceListTemplate
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main], {
		//	summary:
		//		Vista de catálogo de dispositivos.

		constructor: function (args) {

			this.config = {
				title: this.i18n.devices,
				ownChannel: 'deviceCatalog',
				target: this.services.device,

				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: DeviceListTemplate,
				orderConfig: {
					options: [
						{value: 'name'},
						{value: 'model'},
						{value: 'updated'}
					]
				},
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Order,
					config: 'orderConfig'
				}]
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.device
			}, this.facetsConfig || {}]);
		}
	});
});
