define([
	'dojo/_base/declare'
	, 'src/detail/_Detail'
	, 'src/redmicConfig'
	, 'templates/ActivityList'
], function(
	declare
	, _Detail
	, redmicConfig
	, TemplateActivities
) {

	return declare(_Detail, {
		//	summary:
		//		Base de vistas de detalle para entidades relacionadas con actividades.

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			this.addTargetToArray(this.ancestorsTarget);

			this._activityListPrepareDetailWidget();
		},

		_activityListPrepareDetailWidget: function() {

			const configProps = {
				title: 'activities',
				target: this.activitiesTargetBase,
				template: TemplateActivities,
				href: redmicConfig.viewPaths.activityDetails
			};

			const activityList = this._merge([this._getActivitiesOrProjectsConfig(configProps), {
				width: 3,
				height: 4
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {activityList}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('activityList').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this.inherited(arguments);

			this._getActivityTargetData();
		},

		_showWidgets: function() {

			this.inherited(arguments);

			this._showWidget('activityList');
		},

		_getActivityTargetData: function() {

			this._emitEvt('REQUEST', {
				method: 'GET',
				target: this.activitiesTargetBase,
				params: {
					path: {
						id: this.pathVariableId
					}
				}
			});
		}
	});
});
