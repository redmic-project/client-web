define([
	"app/designs/textSearchFacetsList/main/Species"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'src/catalog/_GenerateReport'
	, 'src/redmicConfig'
], function (
	SpeciesMain
	, declare
	, lang
	, _GenerateReport
	, redmicConfig
){
	return declare([SpeciesMain, _GenerateReport], {
		//	summary:
		//		Vista de Species Catalog.

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.species,
				reportService: "species",
				title: this.i18n.speciesCatalogView,
				ownChannel: "speciesCatalog",
				filtersInTabs: true
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-info-circle",
							btnId: "details",
							title: 'info',
							href: this.viewPaths.speciesCatalogDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
