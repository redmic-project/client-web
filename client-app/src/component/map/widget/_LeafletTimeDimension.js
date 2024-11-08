define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
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
				timeDimensionCurrentTime: moment().startOf('day').subtract(1, 'days').toDate(),
				timeDimensionControlPosition: 'bottomleft',
				timeDimensionMinSpeed: 0.1,
				timeDimensionMaxSpeed: 1,
				timeDimensionSpeedStep: 0.1,
				timeDimensionTransitionTime: 2000,
				timeDimensionBuffer: 3,
				timeDimensionMinBufferReady: 1,

				timeDimensionMinTime: null,
				timeDimensionMaxTime: moment().startOf('day').toDate(),

				getTimeDimensionExternalContainer: null,

				_layersWithTimeDimension: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_addMapLayer', lang.hitch(this, this._addTimeDimensionMapLayer));
			aspect.before(this, '_removeMapLayer', lang.hitch(this, this._removeTimeDimensionMapLayer));
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
				timeLimitsObj.startMoment = moment(this.timeDimensionMinTime);
				timeLimitsObj.startTime = timeLimitsObj.startMoment.toDate();
			}

			if (this.timeDimensionMaxTime) {
				timeLimitsObj.endMoment = moment(this.timeDimensionMaxTime);
				timeLimitsObj.endTime = timeLimitsObj.endMoment.toDate();
			}

			var times = L.TimeDimension.Util.explodeTimeRange(timeLimitsObj.startTime, timeLimitsObj.endTime,
				this.timeDimensionPeriod);

			this._timeDimensionInstance.setAvailableTimes(times, 'replace');

			if (this.timeDimensionCurrentTime) {
				this._timeDimensionInstance.setCurrentTime(this.timeDimensionCurrentTime);
			}

			this._setValidTimePosition(timeLimitsObj);
		},

		_getCurrentLayersTimeLimits: function() {

			var layersTimeDefinitions = Object.values(this._layersWithTimeDimension),
				startMoment, endMoment;

			layersTimeDefinitions.forEach(function(item) {

				var itemStartMoment = moment(item.startDate),
					itemEndMoment = moment(item.endDate);

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
				currTime = this._timeDimensionInstance.getCurrentTime(),
				validTimePosition = currTime;

			if (currStartMoment.isAfter(currTime)) {
				validTimePosition = timeLimitsObj.startTime;
			} else if (currEndMoment.isBefore(currTime)) {
				validTimePosition = timeLimitsObj.endTime;
			}

			this._timeDimensionInstance.setCurrentTime(validTimePosition);
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

			if (this.getTimeDimensionExternalContainer) {
				this._manageTimeDimensionControlLocation();
			}
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

			put(externalContainer, this._timeDimensionControlInstance._container);
		},

		_removeTimeDimensionWidget: function() {

			this._timeDimensionControlInstance.remove();

			delete this._timeDimensionControlInstance;
			delete this._timeDimensionInstance;
		},

		_getInnerLayer: function(_layer, layerId) {

			var originalLayer = this.inherited(arguments);

			if (!originalLayer || !this._layersWithTimeDimension[layerId]) {
				return originalLayer;
			}

			var timeDimensionLayer = L.timeDimension.layer.wms(originalLayer, {
				timeDimension: this._timeDimensionInstance
			});

			this._setLayerAvailableTimes(timeDimensionLayer, this._layersWithTimeDimension[layerId]);

			this._timeDimensionInstance.registerSyncedLayer(timeDimensionLayer);

			return timeDimensionLayer;
		},

		_setLayerAvailableTimes: function(layerInstance, timeDefinition) {

			var layerStartTime = moment(timeDefinition.startDate).toDate(),
				layerEndTime = moment(timeDefinition.endDate).toDate(),
				layerPeriod = timeDefinition.period || this.timeDimensionPeriod,
				timesArray = L.TimeDimension.Util.explodeTimeRange(layerStartTime, layerEndTime, layerPeriod);

			layerInstance.setAvailableTimes(timesArray);
		}
	});
});
