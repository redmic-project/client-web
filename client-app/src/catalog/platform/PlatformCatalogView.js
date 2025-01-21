define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/PlatformList'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Total'
], function(
	_Main
	, TextSearchFacetsListController
	, TextSearchFacetsListLayout
	, redmicConfig
	, declare
	, lang
	, PlatformListTemplate
	, _Select
	, SelectionBox
	, Order
	, Total
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main], {
		//	summary:
		//		Vista de catálogo de plataformas.

		constructor: function(args) {

			this.config = {
				title: this.i18n.platformCatalogView,
				ownChannel: 'platformCatalog',
				target: redmicConfig.services.platform,

				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: PlatformListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.platformDetails
						}]
					}
				},
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
						{value: 'name'},
						{value: 'updated'}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.platform
			}, this.facetsConfig || {}]);
		}
	});
});
