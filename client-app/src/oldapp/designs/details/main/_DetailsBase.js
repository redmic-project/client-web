define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'src/detail/_WidgetDefinition'
	, "templates/ActivityList"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, declare
	, lang
	, _WidgetDefinition
	, TemplateActivities
) {

	return declare([Layout, Controller, _Main, _AddTitle, _WidgetDefinition], {
		//	summary:
		//		Base de vistas detalle.

		constructor: function(args) {

			this.activityTarget = "activities";

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.target = [this.target];

			if (this.templateTitle) {
				this.titleWidgetConfig = this._merge([{
					template: this.templateTitle
				}, this.titleWidgetConfig || {}]);
			}

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					template: this.templateInfo,
					target: this.target[0]
				}),
				activityList: this._getActivitiesOrProjectsConfig({
					title: 'activities',
					target: this.activityTarget,
					template: TemplateActivities,
					href: this.viewPathsWidgets.activities
				})
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this._checkPathVariableId();
			this._getMainTargetData();
			this._prepareActivityTarget();
			this._getActivityTargetData();
		},

		_getMainTargetData: function() {

			this._emitEvt('GET', {
				target: this.target[0],
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
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

			if (resWrapper.target === this.target[1]) {
				this._dataToActivities(res);
			}
		},

		_dataToActivities: function(response) {

			var data = response.data;

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.activityTarget
			});
		}
	});
});
