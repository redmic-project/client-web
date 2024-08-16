define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/oldapp/designs/details/main/_DetailsBase'
	, 'src/redmicConfig'
	, 'templates/ProjectInfo'
], function(
	declare
	, lang
	, _DetailsBase
	, redmicConfig
	, TemplateInfo
) {

	return declare(_DetailsBase, {
		//	summary:
		//		Vista detalle de Project.

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
				reportService: 'project'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

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
