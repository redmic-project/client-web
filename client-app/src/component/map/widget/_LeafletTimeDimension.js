define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/Deferred'
	, 'leaflet'
	, 'moment'
	, 'put-selector'

	, 'leaflet-nontiledlayer'
	, 'iso8601-js-period'
	, 'L-timeDimension'
], function(
	declare
	, lang
	, aspect
	, Deferred
	, L
	, moment
	, put
) {

	return declare(null, {
		//	summary:
		//		Incluye y configura widget Leaflet.TimeDimension para Leaflet.

		constructor: function(args) {

			this.config = {
				timeDimensionPeriod: 'P1D',
				timeDimensionCurrentTime: moment().utc().startOf('day').subtract(1, 'days'),
				timeDimensionControlPosition: 'bottomleft',
				timeDimensionMinSpeed: 0.1,
				timeDimensionMaxSpeed: 1,
				timeDimensionSpeedStep: 0.1,
				timeDimensionTransitionTime: 2000,
				timeDimensionBuffer: 3,
				timeDimensionMinBufferReady: 1,

				timeDimensionMinTime: null,
				timeDimensionMaxTime: moment().utc().startOf('day'),

				getTimeDimensionExternalContainer: null,
				reducedTimeDimensionClass: 'timeDimensionReduced',

				_layersWithTimeDimension: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_addMapLayer', lang.hitch(this, this._addTimeDimensionMapLayer));
			aspect.before(this, '_removeMapLayer', lang.hitch(this, this._removeTimeDimensionMapLayer));
			aspect.before(this, '_resize', lang.hitch(this, this._resizeTimeDimension));
		},

		_resizeTimeDimension: function() {

			if (!this._timeDimensionInstance) {
				return;
			}

			this._evaluateLowWidthCondition();
			this._updateTimeDimensionWidget();
		},

		_evaluateLowWidthCondition: function() {

			var controlContainer = this._getTimeDimensionControlContainer();

			if (!controlContainer) {
				return;
			}

			if (this._getLowWidth()) {
				put(controlContainer, '.' + this.reducedTimeDimensionClass);
			} else {
				put(controlContainer, '!' + this.reducedTimeDimensionClass);
			}
		},

		_addTimeDimensionMapLayer: function(obj) {

			var atlasItem = obj && obj.atlasItem;

			if (!atlasItem) {
				return;
			}

			var timeDefinition = atlasItem.timeDefinition;

			if (!timeDefinition) {
				return;
			}

			var layerId = obj.layerId || (obj.layer && obj.layer.layerId);

			this._layersWithTimeDimension[layerId] = timeDefinition;

			if (!this._timeDimensionInstance) {
				this._addTimeDimensionWidget();
				this._evaluateLowWidthCondition();
			}

			this._updateTimeDimensionWidget();
		},

		_removeTimeDimensionMapLayer: function(layerId) {

			if (!this._layersWithTimeDimension[layerId]) {
				return;
			}

			delete this._layersWithTimeDimension[layerId];

			var layerInstance = this._overlayLayers[layerId].instance;
			this._timeDimensionInstance.unregisterSyncedLayer(layerInstance);

			var layersWithTimeDimensionCount = Object.keys(this._layersWithTimeDimension).length;

			if (!layersWithTimeDimensionCount && this._timeDimensionInstance) {
				this._removeTimeDimensionWidget();
				return;
			}

			this._updateTimeDimensionWidget();
		},

		_updateTimeDimensionWidget: function() {

			var timeLimitsObj = this._getCurrentLayersTimeLimits();

			if (this.timeDimensionMinTime) {
				timeLimitsObj.startMoment = this.timeDimensionMinTime;
				timeLimitsObj.startTime = timeLimitsObj.startMoment.toDate();
			}

			if (this.timeDimensionMaxTime) {
				timeLimitsObj.endMoment = this.timeDimensionMaxTime;
				timeLimitsObj.endTime = timeLimitsObj.endMoment.toDate();
			}

			var times = L.TimeDimension.Util.explodeTimeRange(timeLimitsObj.startTime, timeLimitsObj.endTime,
				this.timeDimensionPeriod);

			this._timeDimensionInstance.setAvailableTimes(times, 'replace');

			this._setValidTimePosition(timeLimitsObj);
		},

		_getCurrentLayersTimeLimits: function() {

			var layersTimeDefinitions = Object.values(this._layersWithTimeDimension),
				startMoment, endMoment;

			layersTimeDefinitions.forEach(function(item) {

				var itemStartMoment = moment(item.startDate).utc(),
					itemEndMoment = moment(item.endDate).utc();

				if (!startMoment || itemStartMoment.isBefore(startMoment)) {
					startMoment = itemStartMoment;
				}
				if (!endMoment || itemEndMoment.isAfter(endMoment)) {
					endMoment = itemEndMoment;
				}
			});

			return {
				startMoment: startMoment,
				endMoment: endMoment,
				startTime: startMoment.toDate(),
				endTime: endMoment.toDate()
			};
		},

		_setValidTimePosition: function(timeLimitsObj) {

			var currStartMoment = timeLimitsObj.startMoment,
				currEndMoment = timeLimitsObj.endMoment,
				currTime = this.timeDimensionCurrentTime || this._getCurrentlySelectedTime(),
				validTimePosition = currTime;

			if (currStartMoment.isAfter(currTime)) {
				validTimePosition = timeLimitsObj.startTime;
			} else if (currEndMoment.isBefore(currTime)) {
				validTimePosition = timeLimitsObj.endTime;
			}

			this._timeDimensionInstance.setCurrentTime(validTimePosition);
		},

		_getCurrentlySelectedTime: function() {

			return this._timeDimensionInstance && this._timeDimensionInstance.getCurrentTime();
		},

		_addTimeDimensionWidget: function() {

			this._timeDimensionInstance = new L.TimeDimension({
				period: this.timeDimensionPeriod
			});

			this._timeDimensionControlInstance = new L.Control.TimeDimension({
				timeDimension: this._timeDimensionInstance,
				playerOptions: {
					transitionTime: this.timeDimensionTransitionTime,
					buffer: this.timeDimensionBuffer,
					minBufferReady: this.timeDimensionMinBufferReady,
					loop: true,
					startOver: true
				},
				position: this.timeDimensionControlPosition,
				limitSliders: true,
				autoPlay: false,
				minSpeed: this.timeDimensionMinSpeed,
				maxSpeed: this.timeDimensionMaxSpeed,
				speedStep: this.timeDimensionSpeedStep
			}).addTo(this.map);

			this._listenTimeDimensionEvents();

			if (this.getTimeDimensionExternalContainer) {
				this._manageTimeDimensionControlLocation();
			}
		},

		_listenTimeDimensionEvents: function() {

			var playerInstance = this._timeDimensionControlInstance._player;

			playerInstance.on('play', lang.hitch(this, this._onTimeDimensionPlay));
			playerInstance.on('stop', lang.hitch(this, this._onTimeDimensionStop));
			playerInstance.on('speedchange', lang.hitch(this, this._onTimeDimensionSpeedChange));
		},

		_manageTimeDimensionControlLocation: function() {

			var externalContainer = this.getTimeDimensionExternalContainer();

			if (!externalContainer) {
				return;
			}

			if (externalContainer.then) {
				externalContainer.then(lang.hitch(this, this._relocateTimeDimensionControl));
			} else {
				this._relocateTimeDimensionControl(externalContainer);
			}
		},

		_relocateTimeDimensionControl: function(externalContainer) {

			if (!externalContainer) {
				return;
			}

			put(externalContainer, this._getTimeDimensionControlContainer());
		},

		_getTimeDimensionControlContainer: function() {

			return this._timeDimensionControlInstance && this._timeDimensionControlInstance._container;
		},

		_onTimeDimensionPlay: function(_evt) {

			this._emitEvt('TRACK', {
				event: 'play_map_timedimension'
			});
		},

		_onTimeDimensionStop: function(_evt) {

			this._emitEvt('TRACK', {
				event: 'pause_map_timedimension'
			});
		},

		_onTimeDimensionSpeedChange: function(evt) {

			this._emitEvt('TRACK', {
				event: 'changespeed_map_timedimension',
				value: 1000 / evt.transitionTime
			});
		},

		_removeTimeDimensionWidget: function() {

			this._timeDimensionControlInstance.remove();

			delete this._timeDimensionControlInstance;
			delete this._timeDimensionInstance;
		},

		_getInnerLayer: function(layer, layerId) {

			var originalInnerLayer = this.inherited(arguments);

			if (!originalInnerLayer || !this._layersWithTimeDimension[layerId]) {
				return originalInnerLayer;
			}

			if (originalInnerLayer.then) {
				var timeDimensionLayerDfd = new Deferred();

				originalInnerLayer.then(lang.hitch(this, function(objArg, innerLayer) {

					var dfd = objArg.dfd,
						layer = objArg.layer,
						layerId = objArg.layerId,
						timeDimensionLayer = this._prepareLayerForUsageWithTimeDimension(layer, layerId, innerLayer);

					dfd.resolve(timeDimensionLayer);
				}, {
					layer: layer,
					layerId: layerId,
					dfd: timeDimensionLayerDfd
				}));

				return timeDimensionLayerDfd;
			}

			return this._prepareLayerForUsageWithTimeDimension(layer, layerId, originalInnerLayer);
		},

		_prepareLayerForUsageWithTimeDimension: function(layer, layerId, innerLayer) {

			var timeDimensionLayer = this._getLayerWithTimeDimensionWrapper(layerId, innerLayer);

			this._publish(layer.getChannel('SET_PROPS'), {
				layer: timeDimensionLayer
			});

			return timeDimensionLayer;
		},

		_getLayerWithTimeDimensionWrapper: function(layerId, innerLayer) {

			var layerWithoutTimeDimension = innerLayer.getBaseLayer ? innerLayer.getBaseLayer() : innerLayer;

			var timeDimensionLayer = L.timeDimension.layer.wms(layerWithoutTimeDimension, {
				timeDimension: this._timeDimensionInstance
			});

			this._setLayerAvailableTimes(timeDimensionLayer, this._layersWithTimeDimension[layerId]);

			this._timeDimensionInstance.registerSyncedLayer(timeDimensionLayer);

			return timeDimensionLayer;
		},

		_setLayerAvailableTimes: function(layerInstance, timeDefinition) {

			var layerStartTime = moment(timeDefinition.startDate).utc().toDate(),
				layerEndTime = moment(timeDefinition.endDate).utc().toDate(),
				layerPeriod = timeDefinition.period || this.timeDimensionPeriod,
				timesArray = L.TimeDimension.Util.explodeTimeRange(layerStartTime, layerEndTime, layerPeriod);

			layerInstance.setAvailableTimes(timesArray);
		},

		_getMapClickEventValue: function(evt) {

			var inheritedValue = this.inherited(arguments) || {};

			return this._merge([inheritedValue, {
				time: this._getCurrentlySelectedTime()
			}]);
		}
	});
});
