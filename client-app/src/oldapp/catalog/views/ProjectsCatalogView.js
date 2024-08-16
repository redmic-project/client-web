define([
	"app/designs/textSearchFacetsList/main/Project"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	ProjectMain
	, redmicConfig
	, declare
	, lang
){
	return declare(ProjectMain, {
		//	summary:
		//		Vista de Project Catalog.

		constructor: function (args) {

			this.config = {
				mask: {"download":{}},
				target: redmicConfig.services.project,
				reportService: "project",
				title: this.i18n.projectCatalogView,
				ownChannel: "projectCatalog"
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
							href: this.viewPaths.projectDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
