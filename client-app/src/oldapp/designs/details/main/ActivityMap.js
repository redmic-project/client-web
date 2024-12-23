define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/map/layer/PruneClusterLayerImpl"
	, "src/component/map/layer/_RadiusOnClick"
	, "app/designs/mapWithSideContent/main/Geographic"
], function(
	_Main
	, Controller
	, Layout
	, declare
	, lang
	, PruneClusterLayerImpl
	, _RadiusOnClick
	, Geographic
){
	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Vista detalle de ActivityMap.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				_activeRadius: true,
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				},
				targetReplaceParameter: 'id'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this._replacePathVariableIdInTarget();

			this.widgetConfigs = this._merge([{
				geographic: {
					width: 6,
					height: 6,
					type: Geographic,
					props: {
						title: 'map',
						target: this.targetChange,
						classWindowContent: "view",
						filterConfig: {
							initQuery: {
								size: null
							}
						},
						browserConfig: {
							rowConfig: {
								buttonsConfig: {
									listButton: [{
										icon: "fa-map-marker",
										title: 'mapCentering',
										btnId: "mapCentering",
										returnItem: true
									}]
								}
							}
						}
					}
				}
			}, this.widgetConfigs || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.layerConfig = this._merge([{
				idProperty: 'uuid',
				parentChannel: this.getChannel(),
				categoryStyle: "bubbles",
				getPopupContent: lang.hitch(this, this._getPopupContent),
				simpleSelection: true,
				getMarkerCategory: function(feature) {

					if (feature.properties && feature.properties.infrastructureType)
						return feature.properties.infrastructureType.id - 1;
					return 0;
				}
			}, this.layerConfig || {}]);
		},

		_replacePathVariableIdInTarget: function() {

			var replaceObj = {};
			replaceObj[this.targetReplaceParameter] = this.pathVariableId;

			this.targetChange = lang.replace(this.templateTargetChange, replaceObj);
		},

		_initialize: function() {

			if (!this.definitionLayer) {
				this.definitionLayer = [PruneClusterLayerImpl];
			}

			if (this._activeRadius) {
				this.definitionLayer.push(_RadiusOnClick);
			}

			this._layerDefinition = declare(this.definitionLayer);
		},

		_afterShow: function() {

			if (this.layerInstance) {
				this.startup();
				return;
			}

			var widgetInstance = this._getWidgetInstance('geographic');

			this.layerConfig = this._merge([{
				mapChannel: widgetInstance.getChildChannel("map"),
				selectorChannel: widgetInstance.getChannel()
			}, this.layerConfig || {}]);

			this.layerInstance = new this._layerDefinition(this.layerConfig);

			this._publish(widgetInstance.getChildChannel("map", "ADD_LAYER"), this.layerInstance);

			this._publish(widgetInstance.getChildChannel("mapCenteringGateway", "ADD_CHANNELS_DEFINITION"), {
				channelsDefinition: [{
					input: widgetInstance.getChildChannel("browser", "BUTTON_EVENT"),
					output: this.layerInstance.getChannel("SET_CENTER"),
					subMethod: "setCenter"
				},{
					input: widgetInstance.getChildChannel("browser", "BUTTON_EVENT"),
					output: this.layerInstance.getChannel("ANIMATE_MARKER"),
					subMethod: "animateMarker"
				}]
			});

			this.startup();
		},

		_clearModules: function() {

			var widgetInstance = this._getWidgetInstance('geographic');
			this._publish(widgetInstance.getChannel("CLEAR"));
			this._publish(widgetInstance.getChannel("REFRESH"));
		},

		_refreshModules: function() {

			/*this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});*/

			this._replacePathVariableIdInTarget();

			this.layerInstance && this._publish(this.layerInstance.getChannel("CHANGE_TARGET"), {
				target: this.targetChange
			});

			var widgetInstance = this._getWidgetInstance('geographic');
			this._publish(widgetInstance.getChannel("UPDATE_TARGET"), {
				target: this.targetChange,
				refresh: true
			});
		},

		_getPopupContent: function(data) {

			return this.templatePopup({
				i18n: this.i18n,
				feature: data.feature
			});
		}
	});
});
