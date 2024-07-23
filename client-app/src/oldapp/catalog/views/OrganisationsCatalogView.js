define([
	"app/designs/textSearchFacetsList/main/Organisation"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	OrganisationMain
	, redmicConfig
	, declare
	, lang
){
	return declare(OrganisationMain, {
		//	summary:
		//		Vista de Organisation Catalog.

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.organisation,
				title: this.i18n.organisationCatalogView,
				ownChannel: "organisationCatalog"
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
							title: "info",
							href: this.viewPaths.organisationCatalogDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
