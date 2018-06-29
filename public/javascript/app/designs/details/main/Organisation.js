define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/OrganisationInfo"
	, "./_DetailsBase"
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, _DetailsBase
){
	return declare([_DetailsBase], {
		//	summary:
		//		Vista detalle de Organisation.


		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.organisation,
				activitiesTargetBase: redmicConfig.services.activityOrganisations,
				templateInfo: TemplateInfo
			};

			lang.mixin(this, this.config, args);
		}
	});
});
