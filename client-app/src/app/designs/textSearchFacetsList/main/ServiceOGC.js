define([
	"app/designs/base/_Main"
	, "app/designs/base/_ServiceOGC"
	, 'app/base/views/extensions/_AddCompositeSearchInTooltipFromTextSearch'
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/HierarchicalImpl"
	, "redmic/modules/browser/bars/Order"
	, "templates/ServiceOGCList"
], function(
	_Main
	, _ServiceOGC
	, _AddComposite
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, HierarchicalImpl
	, Order
	, templateList
){
	return declare([Layout, Controller, _Main, _ServiceOGC, _AddComposite], {
		//	summary:
		//		Extensión para establecer la configuración de las vistas de .
		//	description:
		//

		constructor: function(args) {

			this.config = {
				title: this.i18n["service-ogc"],
				target: redmicConfig.services.atlasLayer
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.browserBase.shift();
			this.browserBase.unshift(HierarchicalImpl);

			this.browserConfig = this._merge([{
				template: templateList,
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
						{value: "name"},
						{value: "title"},
						{value: "themeInspire"},
						{value: "protocols"}/*,
						{value: "updated"}*/
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
