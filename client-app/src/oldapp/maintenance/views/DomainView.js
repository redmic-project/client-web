define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "app/base/views/_ViewListBase"
], function(
	Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _ViewListBase
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista detalle de los dominios.

		constructor: function(args) {

			this.config = {
				noScroll: true,
				propsWidget: {
					omitTitleCloseButton: true
				}
			};

			this.widgetConfigs = {
				administrative: {
					width: 3,
					height: 3,
					type: _ViewListBase,
					props: {
						title: this.i18n.administrative,
						"class": "containerDetails",
						items: {
							catergoryId: 109,
							modules: []
						},
						specialDomains: [30]
					}
				},
				speciesAndTaxonomy: {
					width: 3,
					height: 3,
					type: _ViewListBase,
					props: {
						title: this.i18n.speciesAndTaxonomy,
						"class": "containerDetails",
						items: {
							catergoryId: 110,
							modules: []
						}
					}
				},
				dataAndObservations: {
					width: 3,
					height: 3,
					type: _ViewListBase,
					props: {
						title: this.i18n.dataAndObservations,
						"class": "containerDetails",
						items: {
							catergoryId: 111,
							modules: []
						},
						specialDomains: [64, 93, 63, 94]
					}
				},
				geometryAndClassifications: {
					width: 3,
					height: 3,
					type: _ViewListBase,
					props: {
						title: this.i18n.geometryAndClassifications,
						"class": "containerDetails",
						items: {
							catergoryId: 112,
							modules: []
						},
						specialDomains: [90, 92]
					}
				}
			};
			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

		},

		_afterShow: function(request) {

			this.startup();
		},

		_clearModules: function() {

		},

		_refreshModules: function() {

		},

		_itemAvailable: function(response) {

		}

	});
});
