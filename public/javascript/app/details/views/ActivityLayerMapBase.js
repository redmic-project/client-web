define([
	'app/designs/details/main/ActivityLayerMap'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/map/OpenLayers'
	, 'redmic/modules/map/layer/WmsLayerImpl'
], function(
	ActivityLayerMap
	, redmicConfig
	, declare
	, lang
	, OpenLayers
	, WmsLayerImpl
) {

	return declare(ActivityLayerMap, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: 'activityLayers',
				layerTarget: redmicConfig.services.atlasLayer,
				activityCategory: ['ml'],
				definitionLayer: [WmsLayerImpl],
				_activityLayers: []
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
				}
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

			var data = resWrapper.res.data,
				layers = data.data || [];

			this._emitEvt('INJECT_DATA', {
				target: this.templateTargetChange,
				data: layers
			});

			this._activityLayers = [];

			for (var i = 0; i < layers.length; i++) {
				this._createLayer(layers[i]);
			}
		},

		_createLayer: function(layer) {

			var widgetInstance = this._getWidgetInstance('geographic');

			if (!widgetInstance) {
				return;
			}

			this.layerConfig = this._merge([{
				mapChannel: widgetInstance.getChildChannel('map'),
				layer: OpenLayers.build({
					type: 'wmts',
					url: layer.urlSource,
					props: {
						layers: [layer.name],
						format: 'image/png',
						transparent: true,
						tiled: true
					}
				}),
				selectorChannel: widgetInstance.getChannel()
			}, this.layerConfig || {}]);

			var layerInstance = new this._layerDefinition(this.layerConfig);
			this._activityLayers.push(layerInstance);

			this._publish(widgetInstance.getChildChannel('map', 'ADD_LAYER'), layerInstance);
		}
	});
});
