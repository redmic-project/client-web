define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/browser/_Select'
	, 'redmic/modules/browser/bars/SelectionBox'
	, 'redmic/modules/browser/bars/Order'
	, 'redmic/modules/browser/bars/Total'
	, 'templates/DocumentList'
], function (
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
	, templateList
) {

	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Base de vista de Bibliography/Document.

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
				returnFields: redmicConfig.returnFields.document
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
				aggs: redmicConfig.aggregations.document
			}, this.facetsConfig || {}]);
		},

		_urlCondition: function(item) {

			return !!item.url;
		}
	});
});
