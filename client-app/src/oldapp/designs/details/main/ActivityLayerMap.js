define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/mapWithSideContent/main/Geographic"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'templates/ActivityLayerList'
], function(
	_Main
	, Controller
	, Layout
	, Geographic
	, declare
	, lang
	, ActivityLayerList
) {

	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Vista detalle de ActivityLayerMap.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				geographic: {
					width: 6,
					height: 6,
					type: Geographic,
					props: {
						title: 'map',
						target: this.targetChange,
						classWindowContent: "view",
						notTextSearch: true,
						browserConfig: {
							template: ActivityLayerList,
							rowConfig: {
								buttonsConfig: {
									listButton: [{
										icon: "fa-toggle-on",
										altIcon: "fa-toggle-off",
										btnId: "toggleShowLayer",
										title: "layer",
										state: false,
										returnItem: true
									}]
								}
							}
						}
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			var widgetInstance = this._getWidgetInstance('geographic');
			this._publish(widgetInstance.getChannel("CLEAR"));
			this._publish(widgetInstance.getChannel("REFRESH"));
		},

		_refreshModules: function() {

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this.targetChange = lang.replace(this.templateTargetChange, {id: this.pathVariableId});

			var widgetInstance = this._getWidgetInstance('geographic');

			if (!this._listeningListButtons) {
				this._subscribe(widgetInstance.getChildChannel('browser', 'BUTTON_EVENT'), lang.hitch(this,
					this._subActivityLayersListButtonEvent));

				this._listeningListButtons = true;
			}

			this._publish(widgetInstance.getChannel("UPDATE_TARGET"), {
				target: this.targetChange,
				refresh: true
			});
		},

		_subActivityLayersListButtonEvent: function(res) {

			var btnId = res.btnId;

			if (btnId === 'toggleShowLayer') {
				this._onToggleShowLayer(res);
			}
		},

		_onToggleShowLayer: function(obj) {

			if (obj.state) {
				this._addMapLayer(obj.id, obj.item);
			} else {
				this._removeMapLayer(obj.id);
			}
		},

		_updateToggleShowLayerButton: function(layerId, action) {

			var widgetInstance = this._getWidgetInstance('geographic');

			this._publish(widgetInstance.getChildChannel('browser', action), {
				idProperty: layerId,
				btnId: 'toggleShowLayer'
			});
		},

		_addMapLayer: function(layerId) {

			this._updateToggleShowLayerButton(layerId, 'CHANGE_ROW_BUTTON_TO_MAIN_CLASS');
		},

		_removeMapLayer: function(layerId) {

			this._updateToggleShowLayerButton(layerId, 'CHANGE_ROW_BUTTON_TO_ALT_CLASS');
		}
	});
});
