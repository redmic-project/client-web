define([
	'app/designs/base/_Main'
	, 'app/base/views/extensions/_AddCompositeSearchInTooltipFromTextSearch'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/catalog/_GenerateReport'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Total'
	, 'src/redmicConfig'
	, 'templates/ActivityList'
], function(
	_Main
	, _AddComposite
	, Controller
	, Layout
	, declare
	, lang
	, _GenerateReport
	, _Select
	, Order
	, SelectionBox
	, Total
	, redmicConfig
	, templateList
) {

	return declare([Layout, Controller, _Main, _AddComposite, _GenerateReport], {
		//	summary:
		//		Vista de catálogo de actividades.

		constructor: function(args) {

			this.config = {
				title: this.i18n.activitiesCatalogView,
				ownChannel: 'activitiesCatalog',
				target: redmicConfig.services.activity,

				browserExts: [_Select],

				reportService: 'activity'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				initQuery: {
					returnFields: redmicConfig.returnFields.activity
				}
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.activityDetails
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
						{value: 'activityType.name', label: this.i18n.activityType},
						{value: 'startDate'},
						{value: 'endDate'},
						{value: 'updated'}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.activity
			}, this.facetsConfig || {}]);

			this.textSearchConfig = this._merge([{
				showExpandIcon: true
			}, this.textSearchConfig || {}]);
		}
	});
});
