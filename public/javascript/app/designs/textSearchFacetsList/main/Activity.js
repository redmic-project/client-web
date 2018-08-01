define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/_AddComposite"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ActivityList"
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
		//		Extensión para establecer la configuración de las vistas de activity.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				browserExts: [_Select],
				title: this.i18n.activities
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				initQuery: {
					returnFields: ['id', 'name', 'code', 'endDate', 'activityType', 'activityCategory']
				}
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
						{value: "activityType.name", label: this.i18n.activityType},
						{value: "startDate"},
						{value: "endDate"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: {
					"activityType": {
						"open": true,
						"terms": {
							"field": "activityType.name",
							"size": 20
						}
					},
					"territorialScope": {
						"terms": {
							"field": "scope.name",
							"size": 20
						}
					}
				}
			}, this.facetsConfig || {}]);
		}
	});
});