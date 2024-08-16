define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/project/_ProjectEdition'
	, 'src/oldapp/designs/details/main/_DetailsBase'
	, 'src/redmicConfig'
	, 'templates/ProjectInfo'
], function(
	declare
	, lang
	, _ProjectEdition
	, _DetailsBase
	, redmicConfig
	, TemplateInfo
) {

	return declare([_DetailsBase, _ProjectEdition], {
		//	summary:
		//		Vista de detalle de proyectos.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.project,
				activitiesTargetBase: redmicConfig.services.activityProject,
				templateInfo: TemplateInfo,
				_titleRightButtonsList: [{
					icon: 'fa-print',
					btnId: 'report',
					title: this.i18n.printToPdf
				}],
				reportService: 'project',
				pathParent: redmicConfig.viewPaths.projectCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.inherited(arguments);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				activityList: {
					height: 6
				}
			}]);
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
