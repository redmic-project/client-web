define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ProgramList'
	, 'src/catalog/_GenerateReport'
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
	, ProgramListTemplate
	, _GenerateReport
	, _Select
	, SelectionBox
	, Order
	, Total
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main, _GenerateReport], {
		//	summary:
		//		Vista de catálogo de programas.

		constructor: function(args) {

			this.config = {
				title: this.i18n.programCatalogView,
				ownChannel: 'programCatalog',
				target: redmicConfig.services.program,

				browserExts: [_Select],

				reportService: 'program'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: redmicConfig.returnFields.program
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				template: ProgramListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.programDetails
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
						{value: 'code'},
						{value: 'startDate'},
						{value: 'endDate'},
						{value: 'updated'}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.program
			}, this.facetsConfig || {}]);
		}
	});
});
