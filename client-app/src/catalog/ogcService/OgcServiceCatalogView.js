define([
	'app/designs/base/_Main'
	, 'src/catalog/ogcService/_OgcService'
	, 'app/base/views/extensions/_AddCompositeSearchInTooltipFromTextSearch'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/HierarchicalImpl'
	, 'src/component/browser/bars/Order'
	, 'templates/ServiceOGCList'
], function(
	_Main
	, _OgcService
	, _AddComposite
	, TextSearchFacetsListController
	, TextSearchFacetsListLayout
	, redmicConfig
	, declare
	, lang
	, HierarchicalImpl
	, Order
	, ServiceOGCListTemplate
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main, _OgcService, _AddComposite], {
		//	summary:
		//		Vista de catálogo de servicios OGC.

		constructor: function(args) {

			this.config = {
				title: this.i18n.ogcServiceCatalogView,
				ownChannel: 'ogcServiceCatalog',
				target: redmicConfig.services.atlasLayer
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							href: this.viewPaths.ogcServiceDetails,
							condition: 'urlSource',
							title: 'info'
						}]
					}
				},
				bars: []
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					size: null,
					from: null/*,
					sorts: [{
						field: 'alias',
						order: 'ASC'
					}]*/
				}
			}, this.filterConfig || {}]);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.browserBase.shift();
			this.browserBase.unshift(HierarchicalImpl);

			this.browserConfig = this._merge([{
				template: ServiceOGCListTemplate,
				target: this._atlasDataTarget,
				rowConfig: {
					selectionIdProperty: this.pathProperty
				},
				idProperty: this.pathProperty,
				pathSeparator: this.pathSeparator,
				bars: [{
					instance: Order,
					config: 'orderConfig'
				}],
				orderConfig: {
					options: [
						{value: 'name'},
						{value: 'title'},
						{value: 'themeInspire'},
						{value: 'protocols'}/*,
						{value: 'updated'}*/
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.atlasLayer
			}, this.facetsConfig || {}]);

			this.textSearchConfig = this._merge([{
				showExpandIcon: true
			}, this.textSearchConfig || {}]);
		}
	});
});
