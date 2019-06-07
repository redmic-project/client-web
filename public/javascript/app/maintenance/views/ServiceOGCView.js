define([
	"app/designs/textSearchFacetsList/main/ServiceOGC"
	, "app/base/views/extensions/_EditionLayerElementView"
	, "app/base/views/extensions/_EditionLayerView"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	ServiceOGCMain
	, _EditionLayerElementView
	, _EditionLayerView
	, declare
	, lang
){
	return declare([ServiceOGCMain, _EditionLayerView, _EditionLayerElementView], {
		//	summary:
		//		Vista de ServiceOGC.

		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				ownChannel: "serviceOGC"
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
							href: this.viewPaths.serviceOGCDetails,
							condition: "urlSource"
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
