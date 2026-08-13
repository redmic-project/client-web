define([
	'dojo/_base/declare'
	, 'moment'
	, 'RWidgets/Utilities'
], function(
	declare
	, moment
	, Utilities
) {

	return declare(null, {
		//	summary:
		//		Extensión de la línea de tracking para gestionar la información a representar.

		//	_lineStringFeature: Object
		//		GeoJSON del feature con geometría de tipo 'LineString' que contiene los datos a representar. No se
		//		modificará a menos que se reciban nuevos datos.
		//	_lastClusterPosition: Integer
		//		Posición anterior en términos de cluster.
		//	_lastItemInCluster: Integer
		//		Puntero dentro del cluster actual para indicar cuantos elementos suyos ya han sido consumidos.
		//	_itemsReviewedInPrevClusters: Integer
		//		Contador de elementos (dentro de los cluster) revisados hasta la posición actual.

		postMixInProperties: function() {

			const defaultConfig = {
				_detectionFeatures: [],
				_lineStringFeature: null,

				_lastClusterPosition: 0,
				_lastItemInCluster: 0,
				_itemsReviewedInPrevClusters: 0
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_addData: function(feature) {

			if (!this._group) {
				this._createElements();
			}

			const geometryType = feature?.geometry?.type;
			if (geometryType !== 'Point') {
				return;
			}

			this._detectionFeatures.push(feature);

			if (!this._lineStringFeature) {
				this._lineStringFeature = this._createLineStringFeatureFromPointFeature(feature);
			} else {
				this._addPointFeatureToLineStringFeature(feature);
			}
		},

		_createLineStringFeatureFromPointFeature: function(feature) {

			const pointCoordinates = feature?.geometry?.coordinates;

			if (!pointCoordinates) {
				return;
			}

			return this._buildLineStringFeature([pointCoordinates, pointCoordinates]);
		},

		_buildLineStringFeature: function(coords) {

			const geometry = {
				type: 'LineString',
				coordinates: coords
			};

			return {
				type: 'Feature',
				geometry
			};
		},

		_addPointFeatureToLineStringFeature: function(feature) {

			const currentCoordinates = this._lineStringFeature.geometry.coordinates;
			if (currentCoordinates.length === 2 &&
				currentCoordinates[0][0] === currentCoordinates[1][0] &&
				currentCoordinates[0][1] === currentCoordinates[1][1]) {

				currentCoordinates.pop();
			}
			currentCoordinates.push(feature.geometry.coordinates);
		},

		_chkDataIsAdded: function() {

			return !!this._lineStringFeature;
		},

		_getDataBounds: function() {

			return {
				count: this._getDetectionsCount(),
				start: this._getStartDate(),
				end: this._getEndDate()
			};
		},

		_getFeaturesCount: function() {

			return this._detectionFeatures.length;
		},

		_getDetectionsCount: function() {

			return this._detectionFeatures.reduce((acc, feature) => acc + this._getFeatureDetectionsCount(feature), -1);
		},

		_getFeatureDetectionsCount: function(feature) {

			return feature?.properties?.numberOfDetections ?? 0;
		},

		_getStartDate: function() {

			return this._getFeatureStartDate(this._detectionFeatures[0]);
		},

		_getEndDate: function() {

			return this._getFeatureEndDate(this._detectionFeatures.at(-1));
		},

		_getFeatureStartDate: function(feature) {

			return new Date(feature?.properties?.detectionLimits?.[0]);
		},

		_getFeatureEndDate: function(feature) {

			return new Date(feature?.properties?.detectionLimits?.[1]);
		},

		_getFeatureIndexByNumericPosition: function(numericPosition) {

			let accumulatedDetections = 0;
			return this._detectionFeatures.findIndex(feature => {
				accumulatedDetections += this._getFeatureDetectionsCount(feature);
				return accumulatedDetections > numericPosition;
			});
		},

		_getFeatureIndexByTemporalPosition: function(temporalPosition) {

			const datePos = new Date(temporalPosition);
			return this._detectionFeatures.findIndex(feature =>
				datePos >= this._getFeatureStartDate(feature) && datePos <= this._getFeatureEndDate(feature));
		},

		_getCoordinates: function(feature) {

			return feature?.geometry?.coordinates ?? [];
		},

		_getAxesProps: function() {

			return this._detectionFeatures.map(feature => feature.properties);
		},

		_getAxisProps: function(i) {

			return this._getAxesProps()[i];
		},

		_getLength: function(feature) {

			return this._getCoordinates(feature).length;
		},

		_getLineStringCoordinatesInRange: function(start, end) {

			const coords = this._getCoordinates(this._lineStringFeature);

			return coords.length ? coords.slice(start, end + 1) : coords;
		},

		_buildLineStringFeatureInRange: function(start, end) {

			const coords = this._getLineStringCoordinatesInRange(start, end),
				feature = this._buildLineStringFeature(coords);

			return feature;
		},

		_getIdByPosition: function(/*Integer?*/ pos) {

			var i = Utilities.isValidNumber(pos) ? pos : this._getLength(this._lineStringFeature) - 1,
				clusterIds = this._getClusterIds(i);

			return clusterIds[0];
		},

		_clear: function() {

			this.inherited(arguments);

			this._lineStringFeature = null;
			this._cleanTrackingCluster();
		},

		_getPositionInDomain: function(position) {

			let maxPosition;
			if (typeof posInDomain === 'number') {
				maxPosition = this._getDetectionsCount();
			} else if (this._checkDateIsValid(position)) {
				maxPosition = this._getEndDate();
			}

			return position > maxPosition ? maxPosition : position;
		 },

		_getFeatureIndexByPosition: function(target) {

			if (this._checkDateIsValid(target)) {
				return this._getFeatureIndexByTemporalPosition(target);
			}

			return this._getFeatureIndexByNumericPosition(target);
		},

		_checkDateIsValid: function(date) {

			return date instanceof Date || date._isAMomentObject;
		},

		_cleanAndRedraw: function() {

			const lastPosition = this._lastPosition;

			this._lastPosition = null;
			this._cleanTrackingCluster();

			this._drawUntilPosition(lastPosition);
		},

		_cleanTrackingCluster: function() {

			this._lastClusterPosition = 0;
			this._lastItemInCluster = 0;
			this._itemsReviewedInPrevClusters = 0;
		},

		_getClusterIds: function(i) {

			var axisProps = this._getAxisProps(i),
				axisIds = axisProps?.[this.idsProperty] ?? [axisProps?.[this.idProperty]];

			return axisIds ?? [];
		},

		_getClickedIds: function(axesClicked, axesData) {

			const clickedIds = [];

			axesClicked.each(d => {

				const axisIndex = axesData.indexOf(d),
					pointsIds = this._getClusterIds(axisIndex);

				clickedIds.push(...pointsIds);
			});

			return clickedIds;
		}
	});
});
