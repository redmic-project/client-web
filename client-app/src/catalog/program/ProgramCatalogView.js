define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ProgramList"
	, 'src/catalog/_GenerateReport'
	, 'src/catalog/program/_ProgramEdition'
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
	, _ProgramEdition
	, _Select
	, SelectionBox
	, Order
	, Total
	, Credentials
) {

	var declareItems = [Layout, Controller, _Main, _GenerateReport];

	if (Credentials.userIsEditor()) {
		declareItems.push(_ProgramEdition);
	}

	return declare(declareItems, {
		//	summary:
		//		Vista de catálogo de programas.

		constructor: function(args) {

			this.config = {
				browserExts: [_Select],
				reportService: "program",
				title: this.i18n.programCatalogView,
				ownChannel: "programCatalog",
				target: redmicConfig.services.program,
				perms: null,
				idProperty: "id"
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: redmicConfig.returnFields.program
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
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
						{value: "name"},
						{value: "code"},
						{value: "startDate"},
						{value: "endDate"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.program
			}, this.facetsConfig || {}]);
		}
	});
});
