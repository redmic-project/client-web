define([
	"app/designs/textSearchFacetsList/main/Program"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	ProgramMain
	, redmicConfig
	, declare
	, lang
){
	return declare(ProgramMain, {
		//	summary:
		//		Vista de Program Catalog.

		constructor: function (args) {

			this.config = {
				mask: {"download":{}},
				target: redmicConfig.services.program,
				reportService: "program",
				title: this.i18n.programCatalogView,
				ownChannel: "programCatalog"
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
							href: this.viewPaths.programCatalogDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
