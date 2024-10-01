define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ProjectList"
	, 'src/catalog/_GenerateReport'
	, 'src/catalog/project/_ProjectEdition'
	, "src/component/browser/_Select"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/browser/bars/Order"
	, "src/component/browser/bars/Total"
	, 'src/util/Credentials'
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, templateList
	, _GenerateReport
	, _ProjectEdition
	, _Select
	, SelectionBox
	, Order
	, Total
	, Credentials
) {

	var declareItems = [Layout, Controller, _Main, _GenerateReport];

	if (Credentials.userIsEditor()) {
		declareItems.push(_ProjectEdition);
	}

	return declare(declareItems, {
		//	summary:
		//		Vista de catálogo de proyectos.

		constructor: function(args) {

			this.config = {
				browserExts: [_Select],
				target: redmicConfig.services.project,
				perms: null,
				reportService: "project",
				title: this.i18n.projectCatalogView,
				ownChannel: "projectCatalog"
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
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
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
						{value: "name"},
						{value: "code"},
						{value: "projectGroup.name", label: this.i18n.projectGroup},
						{value: "startDate"},
						{value: "endDate"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.project
			}, this.facetsConfig || {}]);
		}
	});
});
