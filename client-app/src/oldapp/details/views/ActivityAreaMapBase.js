define([
	"app/designs/details/main/ActivityMap"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "templates/AreaPopup"
	, "templates/AreaList"
], function(
	ActivityMap
	, redmicConfig
	, declare
	, lang
	, aspect
	, GeoJsonLayerImpl
	, TemplatePopup
	, TemplateList
){
	return declare(ActivityMap, {
		//	summary:
		//

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: lang.replace(redmicConfig.services.areasByActivity, {activityid: '{id}'}),
				templatePopup: TemplatePopup,
				_activeRadius: false,
				activityCategory: ["ar"],
				definitionLayer: [GeoJsonLayerImpl]
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setBaseConfigurations));
		},

		_setBaseConfigurations: function() {

			this.widgetConfigs = this._merge([{
				geographic: {
					props: {
						browserConfig: {
							template: TemplateList,
							rowConfig: {
								buttonsConfig: {
									listButton: [{
										icon: "fa-map-marker",
										title: 'mapCentering',
										btnId: "mapCentering",
										returnItem: true
									}]
								}
							}
						}
					}
				}
			}, this.widgetConfigs || {}]);

			this.layerConfig = this._merge([{
				onEachFeature: lang.hitch(this, this._onEachFeature)
			}, this.layerConfig || {}]);
		},

		_onEachFeature: function(feature, layer) {

			layer.bindPopup(this.templatePopup({
				feature: feature,
				i18n: this.i18n
			}));
		}
	});
});
