define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ContactInfo"
	, "templates/ContactTitle"
	, "./_DetailsBase"
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, TemplateTitle
	, _DetailsBase
){
	return declare([_DetailsBase], {
		//	summary:
		//		Vista detalle de Contact.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.contact,
				activitiesTargetBase: redmicConfig.services.activityContacts,
				templateInfo: TemplateInfo,
				templateTitle: TemplateTitle
			};

			lang.mixin(this, this.config, args);
		}
	});
});
