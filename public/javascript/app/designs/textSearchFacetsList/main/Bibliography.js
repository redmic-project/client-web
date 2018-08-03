define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/DocumentList"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
], function (
	_Main
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
	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Vista de Bibliography.

		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				idDetails: null,
				browserExts: [_Select],
				title: this.i18n.canarianMarineBibliography
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: ['id', 'title', 'author', 'year', 'documentType', 'language', 'url']
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
						{value: "title"},
						{value: "author"},
						{value: "documentType.name", label: this.i18n.documentType},
						{value: "year"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs:  {
					"documentType": {
						"terms": {
							"field": "documentType.name",
							"size": 30
						}
					},
	 				"language": {
	 					"terms": {
	 						"field": "language",
							"size": 20
	 					}
	 				}
				},
				openFacets: true
			}, this.facetsConfig || {}]);
		}
	});
});
