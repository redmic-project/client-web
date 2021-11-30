define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ProjectInfo"
	, "templates/ProjectList"
	, "./_ActivityBase"
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, TemplateProjects
	, _ActivityBase
){
	return declare([_ActivityBase], {
		//	summary:
		//		Vista detalle de Program.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.program,
				reportService: "program",
				_targetListRank: redmicConfig.services.activityProject,
				_indexListRank: 4
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: this._infoConfig({
					template: TemplateInfo
				}),
				additionalInfo: this._setAdditionalConfig(this.i18n.projects, TemplateProjects,
					this.viewPathsWidgets.projects),
				organisationList: this._organisationsConfig(),
				platformList: this._platformsConfig(),
				contactList: this._contactsConfig(),
				documentList: this._documentsConfig()
			}, this.widgetConfigs || {}]);
		}
	});
});
