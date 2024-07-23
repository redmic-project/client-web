define([
	"app/base/views/extensions/_ListenActivityDataAndAccessByActivityCategory"
	, "app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/mapWithSideContent/main/Tracking"
	, "app/designs/mapWithSideContent/main/_TrackingWithListByFilter"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_ListenActivityDataAndAccessByActivityCategory
	, _Main
	, Controller
	, Layout
	, Tracking
	, _TrackingWithListByFilter
	, redmicConfig
	, declare
	, lang
) {

	return declare([Layout, Controller, _Main, _ListenActivityDataAndAccessByActivityCategory], {
		//	summary:
		//		Vista detalle de Activity tracking.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				},

				baseTargetChildren: redmicConfig.services.elementsTrackingActivity,
				target: [redmicConfig.services.activity],
				activityCategory: ["at", "pt"]
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				tracking: {
					width: 6,
					height: 6,
					type: declare([Tracking, _TrackingWithListByFilter]),
					props: {
						classWindowContent: "view"
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			var widgetInstance = this._getWidgetInstance('tracking');
			this._publish(widgetInstance.getChannel("CLEAR"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			var widgetInstance = this._getWidgetInstance('tracking');
			this._publish(widgetInstance.getChannel("SET_PROPS"), {
				pathVariableId: this.pathVariableId
			});

			this._emitEvt('GET', {
				target: this.target[0],
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(item) {

			var target = lang.replace(this.baseTargetChildren, item.data);

			this.target[1] = target;

			var widgetInstance = this._getWidgetInstance('tracking');
			this._publish(widgetInstance.getChannel("UPDATE_TARGET"), {
				target: target,
				refresh: true
			});
		}
	});
});
