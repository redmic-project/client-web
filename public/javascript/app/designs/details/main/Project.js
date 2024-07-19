define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ActivityList"
	, "templates/ProjectInfo"
	, 'src/view/detail/_WidgetDefinition'
	, "./_ActivityBase"
], function(
	redmicConfig
	, declare
	, lang
	, TemplateActivities
	, TemplateInfo
	, _WidgetDefinition
	, _ActivityBase
){
	return declare([_ActivityBase, _WidgetDefinition], {
		//	summary:
		//		Vista detalle de Project.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.project,
				reportService: "project",
				_targetListRank: redmicConfig.services.activityProject,
				_indexListRank: 4
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					template: TemplateInfo
				}),
				childActivitiesOrProjects: this._getChildActivitiesOrProjectsConfig(this.i18n.activities, TemplateActivities,
					this.viewPathsWidgets.activities
				),
				organisationList: this._getOrganisationsConfig(),
				platformList: this._getPlatformsConfig(),
				contactList: this._getContactsConfig(),
				documentList: this._getDocumentsConfig()
			}, this.widgetConfigs || {}]);
		}
	});
});
