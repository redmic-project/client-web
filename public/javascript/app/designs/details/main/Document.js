define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/DocumentInfo"
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
		//		Vista detalle de Document.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [{
					icon: "fa-print",
					btnId: "report",
					title: this.i18n.print
				}],

				target: redmicConfig.services.document,
				activitiesTargetBase: redmicConfig.services.activityDocuments,
				templateInfo: TemplateInfo,

				reportService: "document"
			};

			lang.mixin(this, this.config, args);
		}
	});
});
