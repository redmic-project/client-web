define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_Detail'
	, 'src/redmicConfig'
	, 'templates/ActivityList'
], function(
	declare
	, lang
	, _Detail
	, redmicConfig
	, TemplateActivities
) {

	return declare(_Detail, {
		//	summary:
		//		Base de vistas de detalle para entidades relacionadas con actividades.

		constructor: function(args) {

			this.config = {
				activityTarget: 'activities'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				activityList: this._getActivitiesOrProjectsConfig({
					title: 'activities',
					target: this.activityTarget,
					template: TemplateActivities,
					href: redmicConfig.viewPaths.activityDetails
				})
			}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('activityList').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this.inherited(arguments);

			this._prepareActivityTarget();
			this._getActivityTargetData();
		},

		_showWidgets: function() {

			this.inherited(arguments);

			this._showWidget('activityList');
		},

		_prepareActivityTarget: function() {

			this.target[1] = lang.replace(this.activitiesTargetBase, {
				id: this.pathVariableId
			});
		},

		_getActivityTargetData: function() {

			this._emitEvt('GET', {
				target: this.target[1],
				requesterId: this.ownChannel,
				id: ''
			});
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target !== this.target[1] || !res?.data) {
				return;
			}

			this._dataToActivities(res.data);
		},

		_dataToActivities: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.activityTarget
			});
		}
	});
});
