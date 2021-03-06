define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/_AddComposite"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ProgramList"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
], function(
	_Main
	, _AddComposite
	, Controller
	, Layout
	, declare
	, lang
	, templateList
	, _Select
	, SelectionBox
	, Order
	, Total
){
	return declare([Layout, Controller, _Main, _AddComposite], {
		//	summary:
		//		Extensión para establecer la configuración de las vistas de program.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				browserExts: [_Select],
				title: this.i18n.programs,
				blockCompositeToUser: true
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: ['id', 'name', 'code', 'endDate']
			}, this.filterConfig || {}]);

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
						{value: "code"},
						{value: "startDate"},
						{value: "endDate"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs:  {
					"territorialScope": {
						"terms": {
							"field": "scope.name",
							"size": 20
						}
					}
				},
				openFacets: true
			}, this.facetsConfig || {}]);
		}
	});
});
