define([
	"app/base/views/extensions/_ListenActivityDataAndAccessByActivityCategory"
	, "app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/designs/mapWithSideContent/main/Tracking"
	, "app/designs/mapWithSideContent/main/_TrackingWithListByFilter"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ActivityTitle"
], function(
	_ListenActivityDataAndAccessByActivityCategory
	, _Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, Tracking
	, _TrackingWithListByFilter
	, redmicConfig
	, declare
	, lang
	, TemplateTitle
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection, _ListenActivityDataAndAccessByActivityCategory], {
		//	summary:
		//		Vista detalle de Activity tracking.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				noScroll: true,
				propsWidget: {
					noButtonsWindow: true,
					noTitleWindow: true
				},

				baseTargetChildren: redmicConfig.services.elementsTrackingActivity,
				target: [redmicConfig.services.activity],
				activityCategory: ["at", "pt"]
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: redmicConfig.services.activity
			}, this.titleWidgetConfig || {}]);

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

		_afterShow: function(request) {

			this.startup();
		},

		_clearModules: function() {

			this._publish(this._widgets.tracking.getChannel("CLEAR"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._publish(this._widgets.tracking.getChannel("SET_PROPS"), {
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

			this._publish(this._widgets.tracking.getChannel("UPDATE_TARGET"), {
				target: target,
				refresh: true
			});
		}
	});
});
