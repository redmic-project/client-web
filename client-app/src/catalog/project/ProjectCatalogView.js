define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ProjectList'
	, 'src/catalog/_GenerateReport'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Total'
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, templateList
	, _GenerateReport
	, _Select
	, SelectionBox
	, Order
	, Total
) {

	return declare([Layout, Controller, _Main, _GenerateReport], {
		//	summary:
		//		Vista de catálogo de proyectos.

		constructor: function(args) {

			this.config = {
				title: this.i18n.projectCatalogView,
				ownChannel: 'projectCatalog',
				target: redmicConfig.services.project,

				browserExts: [_Select],

				reportService: 'project'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: redmicConfig.returnFields.project
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.projectDetails
						}]
					}
				},
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
						{value: 'name'},
						{value: 'code'},
						{value: 'projectGroup.name', label: this.i18n.projectGroup},
						{value: 'startDate'},
						{value: 'endDate'},
						{value: 'updated'}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.project
			}, this.facetsConfig || {}]);
		}
	});
});
