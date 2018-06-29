define([
	"app/designs/details/main/ActivityMap"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "templates/InfrastructurePopup"
	, "templates/InfrastructureList"
], function(
	ActivityMap
	, redmicConfig
	, declare
	, lang
	, aspect
	, TemplatePopup
	, TemplateList
){
	return declare(ActivityMap, {
		//	summary:
		//

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: redmicConfig.services.infrastructureByActivity,
				templatePopup: TemplatePopup,
				_activeRadius: false,
				activityCategory: ["if"]
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
										condition: "url",
										icon: "fa-link",
										btnId: "urlWebcam",
										returnItem: true,
										title: "url"
									},{
										icon: "fa-map-marker",
										title: "map centering",
										btnId: "mapCentering",
										returnItem: true
									}]
								}
							}
						},
						urlWebcamCallback: function(obj) {

							window.open(obj.item.url, '_blank');
						}
					}
				}
			}, this.widgetConfigs || {}]);
		}
	});
});
