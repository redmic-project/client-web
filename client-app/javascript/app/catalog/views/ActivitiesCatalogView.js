define([
	"app/designs/textSearchFacetsList/main/Activity"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	ActivityMain
	, redmicConfig
	, declare
	, lang
){
	return declare(ActivityMain, {
		//	summary:
		//		Vista de Activity Catalog.

		constructor: function (args) {

			this.config = {
				mask: {"download":{}},
				target: redmicConfig.services.activity,
				reportService: "activity",
				title: this.i18n.activitiesCatalogView,
				ownChannel: "activitiesCatalog"
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
							href: this.viewPaths.activityCatalogDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
