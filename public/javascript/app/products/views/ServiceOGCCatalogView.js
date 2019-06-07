define([
	"app/designs/textSearchFacetsList/main/ServiceOGC"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function (
	ServiceOGCMain
	, declare
	, lang
	, aspect
){
	return declare([ServiceOGCMain], {
		//	summary:
		//		Vista de ServiceOGC Catalog.

		constructor: function (args) {

			this.config = {
				title: this.i18n.serviceOGCCatalogView,
				ownChannel: "serviceOGCCatalog"
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
							href: this.viewPaths.serviceOGCCatalogDetails,
							condition: "urlSource",
							title: "info"
						}]
					}
				},
				bars: []
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					size: null,
					from: null/*,
					sorts: [{
						field: "alias",
						order: "ASC"
					}]*/
				}
			}, this.filterConfig || {}]);
		}
	});
});
