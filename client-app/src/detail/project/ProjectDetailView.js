define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_GenerateReport'
	, 'src/detail/project/_ProjectEdition'
	, 'app/designs/details/main/_DetailsBase'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
	, 'templates/ActivityList'
	, 'templates/ProjectInfo'
], function(
	declare
	, lang
	, _GenerateReport
	, _ProjectEdition
	, _DetailsBase
	, redmicConfig
	, Credentials
	, TemplateActivities
	, TemplateInfo
) {

	var declareItems = [_DetailsBase, _GenerateReport];

	if (Credentials.userIsEditor()) {
		declareItems.push(_ProjectEdition);
	}

	return declare(declareItems, {
		//	summary:
		//		Vista de detalle de proyectos.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.project,
				activitiesTargetBase: redmicConfig.services.activityProject,
				reportService: 'project',
				pathParent: redmicConfig.viewPaths.projectCatalog
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
				activityList: this._getActivitiesOrProjectsConfig({
					title: 'activities',
					target: this.activityTarget,
					template: TemplateActivities,
					href: redmicConfig.viewPaths.activityDetails,
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
					returnFields: redmicConfig.returnFields.activity
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
