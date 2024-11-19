define([
	"app/designs/details/main/ActivityMap"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SpeciesDistributionPopup"
], function(
	ActivityMap
	, redmicConfig
	, declare
	, lang
	, TemplatePopup
){
	return declare(ActivityMap, {
		//	summary:
		//

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: redmicConfig.services.citationByActivity,
				templatePopup: TemplatePopup,
				activityCategory: ["ci"]
			};

			lang.mixin(this, this.config, args);
		}
	});
});
