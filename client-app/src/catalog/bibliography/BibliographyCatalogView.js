define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/catalog/_GenerateReport'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Total'
	, 'templates/DocumentList'
], function (
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _GenerateReport
	, _Select
	, SelectionBox
	, Order
	, Total
	, templateList
) {

	return declare([Layout, Controller, _Main, _GenerateReport], {
		//	summary:
		//		Base de vista de Bibliography/Document.

		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				title: this.i18n.canarianMarineBibliography,
				ownChannel: 'bibliography',
				target: redmicConfig.services.document,

				idDetails: null,
				browserExts: [_Select],
				reportService: 'document'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-external-link',
							btnId: 'url',
							condition: this._urlCondition,
							href: '{url}'
						},{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.bibliographyDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
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
