define([
	'app/designs/details/main/ActivityLayerMap'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/_AtlasLayersManagement'
], function(
	ActivityLayerMap
	, redmicConfig
	, declare
	, lang
	, _AtlasLayersManagement
) {

	return declare([ActivityLayerMap, _AtlasLayersManagement], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: 'activityLayers',
				layerTarget: redmicConfig.services.atlasLayer,
				activityCategory: ['ml'],
				_activityLayers: {}
			};

			lang.mixin(this, this.config, args);
		},

		_itemAvailable: function() {

			var storeChannel = this._buildChannel(this.storeChannel, this.actions.AVAILABLE);
			this._once(storeChannel, lang.hitch(this, this._onLayerActivitiesData), {
				predicate: lang.hitch(this, this._chkIsDataFromLayerActivities)
			});

			this._emitEvt('REQUEST', {
				target: this.layerTarget,
				action: '_search',
				method: 'POST',
				query: {
					terms: {
						activities: [this.pathVariableId]
					}
				},
				requesterId: this.getChannel()
			});
		},

		_chkIsDataFromLayerActivities: function(resWrapper) {

			var target = resWrapper.target,
				query = resWrapper.req.query || {},
				terms = query.terms || {},
				activities = terms.activities;

			return target === this.layerTarget && activities && activities.indexOf(this.pathVariableId) !== -1;
		},

		_onLayerActivitiesData: function(resWrapper) {

			var widgetInstance = this._getWidgetInstance('geographic');

			if (!widgetInstance) {
				return;
			}

			var data = resWrapper.res.data,
				layers = data.data || [];

			this._emitEvt('INJECT_DATA', {
				target: this.templateTargetChange,
				data: layers
			});

			this._activityLayers = {};

			for (var i = 0; i < layers.length; i++) {
				var layer = layers[i];
				this._createLayer(widgetInstance, layer);

				if (i === 0) {
					var layerId = layer.id;
					this._addMapLayer(layerId);
				}
			}
		},

		_createLayer: function(widgetInstance, layer) {

			var LayerDefinition = this._getMapLayerComponentDefinition(),
				layerConfiguration = this._getMapLayerComponentConfiguration(layer);

			layerConfiguration = this._merge([layerConfiguration, {
				mapChannel: widgetInstance.getChildChannel('map'),
				selectorChannel: widgetInstance.getChannel()
			}]);

			var mapLayerInstance = new LayerDefinition(layerConfiguration),
				atlasItemId = this._getAtlasItemId(layer);

			this._activityLayers[atlasItemId] = mapLayerInstance;
		},

		_addMapLayer: function(layerId) {

			this.inherited(arguments);

			var widgetInstance = this._getWidgetInstance('geographic');

			if (!widgetInstance) {
				return;
			}

			var layerInstance = this._activityLayers[layerId];

			this._publish(widgetInstance.getChildChannel('map', 'ADD_LAYER'), {
				layer: layerInstance
			});
		},

		_removeMapLayer: function(layerId) {

			this.inherited(arguments);

			var widgetInstance = this._getWidgetInstance('geographic');

			if (!widgetInstance) {
				return;
			}

			var layerInstance = this._activityLayers[layerId];

			this._publish(widgetInstance.getChildChannel('map', 'REMOVE_LAYER'), {
				layer: layerInstance
			});
		}
	});
});
