define([
	'dojo/_base/declare'
	, 'moment'
	, 'src/component/map/layer/_RequestData'
	, 'src/component/map/layer/_ListenZoom'
	, 'src/component/map/layer/_PublishInfo'
	, 'src/component/map/layer/TrackingLayerImpl'
], function(
	declare
	, moment
	, _RequestData
	, _ListenZoom
	, _PublishInfo
	, TrackingLayerImpl
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir una colección de componentes TrackingMapLayer, para representar datos de
		//   seguimiento sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					MOVE_TRACK_TO: 'moveTrackTo',
					SHOW_DIRECTION_MARKERS: 'showDirectionMarkers',
					HIDE_DIRECTION_MARKERS: 'hideDirectionMarkers',
					SET_TRACKING_PROPS: 'setTrackingProps'
				},
				_layerInstances: {},
				_activityIdByUuid: {}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('trackingMapLayerConfig', {
				parentChannel,
				target: this.layersTarget,
				infoTarget: this.infoTarget,
				transitionDuration: this.trackingTransitionRate
			});
		},

		createDesignControllerComponents: function() {

			const inheritedComponents = this.inherited(arguments);

			const mapInstance = inheritedComponents.map,
				mapChannel = mapInstance?.getChannel();

			this._TrackingMapLayer = this._defineDesignTrackingMapLayerComponent(mapChannel);

			return inheritedComponents;
		},

		_defineDesignTrackingMapLayerComponent: function(mapChannel) {

			this.mergeComponentAttribute('trackingMapLayerConfig', {
				mapChannel
			});

			return declare([TrackingLayerImpl, _RequestData, _PublishInfo, _ListenZoom]);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this.on('ME_OR_ANCESTOR_HIDDEN', () => this._addTrackingMapLayerComponentsOnHide());
		},

		_addTrackingLayer: function(item) {

			const uuid = item.uuid;

			let layerInstance = this._layerInstances[uuid];
			if (!layerInstance) {
				layerInstance = this._layerInstances[uuid] = this._createLayerInstance(item);
				this._createSubsAndPubsForLayer(layerInstance);
			}

			this._emitEvt('ADD_LAYER', {layer: layerInstance});

			this._markersAreShown && this._emitEvt('SHOW_DIRECTION_MARKERS');
		},

		_createLayerInstance: function(item) {

			const uuid = item.uuid,
				activityId = item.activityId,
				color = item.color;

			this._activityIdByUuid[uuid] = activityId;

			const targetPathParams = {
				elementuuid: uuid,
				activityid: activityId
			};

			const targetQueryParams = {
				qFlags: [1]
			};

			const infoTargetPathParams = {
				id: activityId
			};

			const layerId = this._generateLayerId(uuid);

			const specificLayerConfig = {
				targetPathParams,
				targetQueryParams,
				infoTargetPathParams,
				fillColor: color,
				layerId,
				layerLabel: layerId
			};

			const layerConfig = this._merge([this.trackingMapLayerConfig, specificLayerConfig]);
			return new this._TrackingMapLayer(layerConfig);
		},

		_generateLayerId: function(uuid) {

			return `tracking_${uuid}`;
		},

		_createSubsAndPubsForLayer: function(layerInstance) {

			this._setSubscriptions([{
				channel: layerInstance.getChannel('DATA_BOUNDS_UPDATED'),
				callback: '_subLayerDataBoundsUpdated'
			}]);

			this._setPublications([{
				event: 'MOVE_TRACK_TO',
				channel: layerInstance.getChannel('GO_TO_POSITION')
			},{
				event: 'SHOW_DIRECTION_MARKERS',
				channel: layerInstance.getChannel('SHOW_DIRECTION_MARKERS')
			},{
				event: 'HIDE_DIRECTION_MARKERS',
				channel: layerInstance.getChannel('HIDE_DIRECTION_MARKERS')
			},{
				event: 'SET_TRACKING_PROPS',
				channel: layerInstance.getChannel('SET_PROPS')
			}]);
		},

		_subLayerDataBoundsUpdated: function(res) {

			this._setTrackingItemLineLimits?.(res);
			this._applyTrackingDataLimits?.();
		},

		_removeTrackingLayer: function(uuid) {

			const layerInstance = this._layerInstances[uuid];
			if (!layerInstance) {
				console.warn(`Tried to remove missing tracking layer '${uuid}'`);
				return;
			}

			this._removeSubsAndPubsForLayer(layerInstance);
			this._removeLayerAssociatedData(layerInstance);
			this._removeLayerInstance(layerInstance, uuid);
		},

		_removeSubsAndPubsForLayer: function(layerInstance) {

			this._removeSubscriptions([
				layerInstance.getChannel('DATA_BOUNDS_UPDATED')
			]);

			this._removePublications([
				layerInstance.getChannel('GO_TO_POSITION'),
				layerInstance.getChannel('SHOW_DIRECTION_MARKERS'),
				layerInstance.getChannel('HIDE_DIRECTION_MARKERS'),
				layerInstance.getChannel('SET_PROPS')
			]);
		},

		_removeLayerAssociatedData: function(layerInstance) {

			const layerId = layerInstance.getOwnChannel();
			this._deleteTrackingItemLimits(layerId);
		},

		_removeLayerInstance: function(layerInstance, uuid) {

			this._publish(layerInstance.getChannel('CLEAR'));
			this._emitEvt('REMOVE_LAYER', {
				layer: layerInstance
			});
			this._publish(layerInstance.getChannel('DISCONNECT'));

			layerInstance.destroy();
			delete this._layerInstances[uuid];
			delete this._activityIdByUuid[uuid];
		},

		_onProgressSliderChangeValue: function(res) {

			this.inherited(arguments);

			let position = res.value,
				animate = false;

			if (this.timeMode) {
				if (!position._isAMomentObject) {
					position = moment(position);
				}
				// TODO controlar si es un salto de 1 en fechas (en base a intervalo) para animar!!
			} else {
				if (this._lastPosition) {
					animate = this._lastPosition === position - 1;
				} else {
					animate = position === 1;
				}
			}

			this._lastPosition = position;

			this._emitEvt('MOVE_TRACK_TO', {
				position,
				animate
			});
		},

		_onTrackingSettingsModeChange: function(value) {

			this.inherited(arguments);

			const delta = value === '0' ? 1 : this._deltaProgress;

			for (let uuid in this._layerInstances) {
				const activityId = this._activityIdByUuid[uuid],
					color = this._getUsedColor?.(uuid);

				this._removeTrackingLayer(uuid);
				this._addTrackingLayer({
					uuid,
					activityId,
					color
				});
			}

			this._applyTrackingDataLimits?.(true);
			this._emitEvt('SET_PROGRESS_DELTA', {
				value: delta
			});
		},

		_onTrackingSettingsRateChange: function(value) {

			this.inherited(arguments);

			const valueInMilliseconds = value * 1000;
			this._emitEvt('SET_PROGRESS_TIMEOUT', {
				value: valueInMilliseconds
			});

			const transitionDuration = this._getTransitionRate(value);
			this._emitEvt('SET_TRACKING_PROPS', {
				transitionDuration
			});
		},

		_getTransitionRate: function(rate) {

			const transitionOffset = 100,
				newTransitionRate = rate - transitionOffset;

			this._trackingTransitionRate = newTransitionRate > 0 ? newTransitionRate : 0;

			return this._trackingTransitionRate;
		},

		_onTrackingSettingsIntervalChange: function(value) {

			this.inherited(arguments);

			this._deltaProgress = value;

			if (this.timeMode) {
				this._emitEvt('SET_PROGRESS_DELTA', {
					value: this._deltaProgress
				});
			}
		},

		_onTrackingSettingsMarkersChange: function(value) {

			this.inherited(arguments);

			if (value === '0') {
				this._emitEvt('HIDE_DIRECTION_MARKERS');
				this._markersAreShown = false;
			} else {
				this._emitEvt('SHOW_DIRECTION_MARKERS');
				this._markersAreShown = true;
			}
		},

		_addTrackingMapLayerComponentsOnHide: function() {

			this._removeAllTrackingLayers();
		},

		_removeAllTrackingLayers: function() {

			for (let uuid in this._layerInstances) {
				this._removeTrackingLayer(uuid);
			}
			this._applyTrackingDataLimits?.();
		}
	});
});
