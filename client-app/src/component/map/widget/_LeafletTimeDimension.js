define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'leaflet'
	, 'moment'

	, 'leaflet-nontiledlayer'
	, 'iso8601-js-period'
	, 'L-timeDimension'
], function(
	declare
	, lang
	, aspect
	, L
	, moment
) {

	return declare(null, {
		//	summary:
		//		Incluye y configura widget Leaflet.TimeDimension para Leaflet.

		constructor: function(args) {

			this.config = {
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

			var layerId = obj.layerId;

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

			var timeLimitsObj = this._getCurrentLayersTimeLimits(),
				times = L.TimeDimension.Util.explodeTimeRange(timeLimitsObj.startTime, timeLimitsObj.endTime, 'P1D');

			this._timeDimensionInstance.setAvailableTimes(times, 'replace');

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
				period: 'P1D'
			});

			this._timeDimensionControlInstance = new L.Control.TimeDimension({
				timeDimension: this._timeDimensionInstance,
				playerOptions: {
					transitionTime: 2000,
					buffer: 5,
					minBufferReady: 2,
					loop: true,
					startOver: true
				},
				position: 'bottomleft',
				limitSliders: true,
				autoPlay: false,
				minSpeed: 0.1,
				maxSpeed: 1,
				speedStep: 0.1
			}).addTo(this.map);
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
				layerPeriod = timeDefinition.period || 'P1D',
				timesArray = L.TimeDimension.Util.explodeTimeRange(layerStartTime, layerEndTime, layerPeriod);

			layerInstance.setAvailableTimes(timesArray);
		}
	});
});
