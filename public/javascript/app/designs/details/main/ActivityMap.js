define([
	"app/base/views/extensions/_ListenActivityDataAndAccessByActivityCategory"
	, "app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/map/layer/PruneClusterLayerImpl"
	, "redmic/modules/map/layer/_RadiusOnClick"
	, "app/designs/mapWithSideContent/main/Geographic"
], function(
	_ListenActivityDataAndAccessByActivityCategory
	, _Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, declare
	, lang
	, PruneClusterLayerImpl
	, _RadiusOnClick
	, Geographic
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection, _ListenActivityDataAndAccessByActivityCategory], {
		//	summary:
		//		Vista detalle de ActivityMap.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				_activeRadius: true,
				noScroll: true,
				propsWidget: {
					noButtonsWindow: true,
					noTitleWindow: true
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.targetChange = lang.replace(this.templateTargetChange, {id: this.pathVariableId});

			this.widgetConfigs = this._merge([{
				geographic: {
					width: 6,
					height: 6,
					type: Geographic,
					props: {
						title: this.i18n.map,
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
										title: "map centering",
										btnId: "mapCentering",
										returnItem: true
									}]
								}
							}
						}
					}
				}
			}, this.widgetConfigs || {}]);

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

		_initialize: function() {

			if (!this.definitionLayer) {
				this.definitionLayer = [PruneClusterLayerImpl];
			}

			if (this._activeRadius) {
				this.definitionLayer.push(_RadiusOnClick);
			}

			this._layerDefinition = declare(this.definitionLayer);
		},

		_afterShow: function(request) {

			if (!this.layerInstance) {

				this.layerConfig = this._merge([{
					mapChannel: this._widgets.geographic.getChildChannel("map"),
					selectorChannel: this._widgets.geographic.getChannel()
				}, this.layerConfig || {}]);

				this.layerInstance = new this._layerDefinition(this.layerConfig);

				this._publish(this._widgets.geographic.getChildChannel("map", "ADD_LAYER"), this.layerInstance);

				this._publish(
					this._widgets.geographic.getChildChannel("mapCenteringGateway", "ADD_CHANNELS_DEFINITION"),
					{
						channelsDefinition: [{
							input: this._widgets.geographic.getChildChannel("browser", "BUTTON_EVENT"),
							output: this.layerInstance.getChannel("ANIMATE_MARKER"),
							subMethod: "animateMarker"
						}]
					}
				);
			}

			this.startup();
		},

		_clearModules: function() {

			this._publish(this._widgets.geographic.getChannel("CLEAR"));
			this._publish(this._widgets.geographic.getChannel("REFRESH"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this.targetChange = lang.replace(this.templateTargetChange, {id: this.pathVariableId});

			this.layerInstance && this._publish(this.layerInstance.getChannel("CHANGE_TARGET"), {
				target: this.targetChange
			});

			this._publish(this._widgets.geographic.getChannel("UPDATE_TARGET"), {
				target: this.targetChange,
				refresh: true
			});
		},

		_itemAvailable: function(response) {

		},

		_getPopupContent: function(data) {

			return this.templatePopup({
				i18n: this.i18n,
				feature: data.feature
			});
		}
	});
});
