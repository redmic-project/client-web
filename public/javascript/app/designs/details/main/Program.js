define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/TabsDisplayer"
	, "templates/ProjectInfo"
	, "templates/ProjectList"
	, "./_ActivityBase"
], function(
	redmicConfig
	, declare
	, lang
	, TabsDisplayer
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
				additionalInfo: {
					width: 3,
					height: 6,
					type: TabsDisplayer,
					props: {
						title: this.i18n.additionalInfo,
						childTabs: [
							this._organisationsConfig(),
							this._platformsConfig(),
							this._contactsConfig(),
							this._documentsConfig(),
							this._setAdditionalConfig(this.i18n.projects, TemplateProjects, this.viewPathsWidgets.projects)
						]
					}
				}
			}, this.widgetConfigs || {}]);
		}
	});
});
