define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/OrganisationList'
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
	, OrganisationListTemplate
	, _Select
	, SelectionBox
	, Order
	, Total
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main], {
		//	summary:
		//		Vista de catálogo de organizaciones.

		constructor: function(args) {

			this.config = {
				title: this.i18n.organisationCatalogView,
				ownChannel: 'organisationCatalog',
				target: redmicConfig.services.organisation,

				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: redmicConfig.returnFields.organisation
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				template: OrganisationListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.organisationDetails
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
						{value: 'organisationType.name', label: this.i18n.organisationType},
						{value: 'acronym'},
						{value: 'updated'}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.organisation
			}, this.facetsConfig || {}]);
		}
	});
});
