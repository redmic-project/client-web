define([
	'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ProjectInfo"
	, "templates/ProjectList"
	, 'src/detail/_WidgetDefinition'
	, "./_ActivityBase"
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, TemplateProjects
	, _WidgetDefinition
	, _ActivityBase
){
	return declare([_ActivityBase, _WidgetDefinition], {
		//	summary:
		//		Vista detalle de Program.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.program,
				reportService: "program",
				_targetListRank: redmicConfig.services.projectProgram,
				_indexListRank: 4
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					template: TemplateInfo
				}),
				childActivitiesOrProjects: this._getActivitiesOrProjectsConfig({
					title: this.i18n.projects,
					template: TemplateProjects,
					href: this.viewPathsWidgets.projects
				}),
				organisationList: this._getOrganisationsConfig(),
				platformList: this._getPlatformsConfig(),
				contactList: this._getContactsConfig(),
				documentList: this._getDocumentsConfig()
			}, this.widgetConfigs || {}]);
		}
	});
});
