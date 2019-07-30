define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/_AddComposite"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/HierarchicalImpl"
	, "redmic/modules/browser/bars/Order"
	, "templates/ServiceOGCList"
], function(
	_Main
	, _AddComposite
	, Controller
	, Layout
	, declare
	, lang
	, HierarchicalImpl
	, Order
	, templateList
){
	return declare([Layout, Controller, _Main, _AddComposite], {
		//	summary:
		//		Extensión para establecer la configuración de las vistas de .
		//	description:
		//

		constructor: function(args) {

			this.config = {
				title: this.i18n["service-ogc"]
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserBase.shift();
			this.browserBase.unshift(HierarchicalImpl);

			this.browserConfig = this._merge([{
				template: templateList,
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
				aggs:  {
					"protocols": {
						'open': true,
						"terms": {
							"field": "protocols.type",
							"nested": "protocols",
							"size": 10
						}
					},
					"themeInspire": {
						'open': true,
						"terms": {
							"field": "themeInspire.name",
							"size": 10
						}
					},
					"keyword": {
						'open': true,
						"terms": {
							"field": "keyword",
							"size": 10
						}
					}
				}
			}, this.facetsConfig || {}]);
		}
	});
});
