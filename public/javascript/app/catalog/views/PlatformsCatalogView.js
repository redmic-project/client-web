define([
	"app/designs/textSearchFacetsList/main/Platform"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	PlatformMain
	, declare
	, lang
){
	return declare(PlatformMain, {
		//	summary:
		//		Vista de Platform Catalog.

		constructor: function (args) {

			this.config = {
				title: this.i18n.platformCatalogView,
				ownChannel: "platformCatalog"
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
							href: this.viewPaths.platformCatalogDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
