define([
	"app/designs/textSearchFacetsList/main/Species"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	SpeciesMain
	, redmicConfig
	, declare
	, lang
){
	return declare(SpeciesMain, {
		//	summary:
		//		Vista de Species Catalog.

		constructor: function (args) {

			this.config = {
				mask: {"download":{}},
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
