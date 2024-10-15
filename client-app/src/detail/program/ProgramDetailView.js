define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_GenerateReport'
	, 'app/designs/details/main/_DetailsBase'
	, 'src/redmicConfig'
	, 'templates/ProgramInfo'
	, 'templates/ProjectList'
], function(
	declare
	, lang
	, _GenerateReport
	, _DetailsBase
	, redmicConfig
	, TemplateInfo
	, TemplateProjects
) {

	return declare([_DetailsBase, _GenerateReport], {
		//	summary:
		//		Vista de detalle de programas.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.program,
				activitiesTargetBase: redmicConfig.services.projectProgram,
				reportService: 'program',
				pathParent: redmicConfig.viewPaths.programCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.target = [this.target];

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					template: TemplateInfo,
					target: this.target[0]
				}),
				projectList: this._getActivitiesOrProjectsConfig({
					title: 'projects',
					target: this.activityTarget,
					template: TemplateProjects,
					href: redmicConfig.viewPaths.projectDetails,
					height: 6
				})
			}, this.widgetConfigs || {}]);
		},

		_getActivityTargetData: function() {

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target[1],
				action: '_search',
				query: {
					returnFields: redmicConfig.returnFields.project
				}
			});
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target[1]) {
				this._dataToActivities(res);
			}
		}
	});
});
