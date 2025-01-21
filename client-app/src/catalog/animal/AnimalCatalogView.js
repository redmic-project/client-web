define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Total'
	, 'templates/AnimalList'
], function(
	_Main
	, TextSearchFacetsListController
	, TextSearchFacetsListLayout
	, redmicConfig
	, declare
	, lang
	, _Select
	, SelectionBox
	, Order
	, Total
	, AnimalListTemplate
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main], {
		//	summary:
		//		Vista de catálogo de animales.

		constructor: function(args) {

			this.config = {
				title: this.i18n.animalCatalogView,
				ownChannel: 'animalCatalog',
				target: redmicConfig.services.animal,

				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: AnimalListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.animalDetails
						}]
					}
				},
				orderConfig: {
					options: [
						{value: 'name'},
						{value: 'scientificName'},
						{value: 'updated'}
					]
				},
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Order,
					config: 'orderConfig'
				}]
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.animal
			}, this.facetsConfig || {}]);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
			}, this.browserConfig || {}]);
		}
	});
});
