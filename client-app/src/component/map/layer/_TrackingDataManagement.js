define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'moment'
	, 'RWidgets/Utilities'
], function(
	declare
	, lang
	, aspect
	, moment
	, Utilities
){
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

		constructor: function(args) {

			this._trackingDataManagementConfig = {
				axesPropsPropName: 'axesProps',
				startDatePropName: 'startDate',
				endDatePropName: 'endDate',

				_lineStringFeature: null,

				_lastClusterPosition: 0,
				_lastItemInCluster: 0,
				_itemsReviewedInPrevClusters: 0
			};

			lang.mixin(this, this._trackingDataManagementConfig, args);

			aspect.after(this, '_clear', lang.hitch(this, this._clearTrackingDataManagement));
		},

		_addData: function(feature) {

			if (!this._group) {
				this._createElements();
			}

			var geometry = feature && feature.geometry,
				geometryType = geometry && geometry.type;

			if (geometryType === 'Point') {
				var newFeature = this._createLineStringFeatureFromPointFeature(feature);
				if (newFeature) {
					this._lineStringFeature = newFeature;
				} else {
					console.error('Cannot create a valid LineString from this feature:', feature);
				}
			} else {
				this._lineStringFeature = feature;
			}
		},

		_createLineStringFeatureFromPointFeature: function(feature) {

			var geometry = feature && feature.geometry,
				geometryCoordinates = geometry && geometry.coordinates;

			if (!geometryCoordinates) {
				return;
			}

			var featureCopy = lang.clone(feature);

			featureCopy.geometry = {
				type: 'LineString',
				coordinates: [geometryCoordinates, geometryCoordinates]
			};

			return featureCopy;
		},

		_chkDataIsAdded: function(req) {

			return !!this._lineStringFeature;
		},

		_getDataBounds: function() {

			return {
				count: this._getClustersSize(),
				start: this._getStartDate(),
				end: this._getEndDate()
			};
		},

		_getCoordinates: function(feature) {

			if (!feature && !this._lineStringFeature) {
				return [];
			}

			var lineStringFeature = feature || this._lineStringFeature;
			return lineStringFeature.geometry.coordinates;
		},

		_getAxesProps: function() {

			if (!this._lineStringFeature) {
				return;
			}

			var featureProps = this._lineStringFeature.properties;
			return featureProps[this.axesPropsPropName] || featureProps;
		},

		_getAxisProps: function(i) {

			var axesProps = this._getAxesProps();

			if (!axesProps) {
				return;
			}

			if (axesProps instanceof Array) {
				return axesProps[i];
			}

			return axesProps;
		},

		_getLength: function(feature) {

			return this._getCoordinates(feature).length;
		},

		_getLineStringCoordinatesInRange: function(start, end) {

			var coords = this._getCoordinates();

			return coords.length ? coords.slice(start, end + 1) : coords;
		},

		_buildLineStringFeature: function(coords) {

			return {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: coords
				}
			};
		},

		_buildLineStringFeatureInRange: function(start, end) {

			var coords = this._getLineStringCoordinatesInRange(start, end),
				feature = this._buildLineStringFeature(coords);

			return feature;
		},

		_getIdByPosition: function(/*Integer?*/ pos) {

			var i = Utilities.isValidNumber(pos) ? pos : this._getLength() - 1,
				clusterIds = this._getClusterIds(i);

			return clusterIds[0];
		},

		_clearTrackingDataManagement: function() {

			this._lineStringFeature = null;
			this._cleanTrackingCluster();
		},

		_getPositionInDomain: function(position) {

			var posInDomain = position,
				maxPos;

			if (typeof posInDomain === 'number') {
				maxPos = this._getClustersSize();

				if (posInDomain > maxPos) {
					posInDomain = maxPos;
				}
			} else if (typeof posInDomain === 'object' && this._checkDateIsValid(posInDomain)) {
				maxPos = this._getEndDate();

				if (posInDomain.isAfter(maxPos)) {
					posInDomain = moment(maxPos);
				}
			}

			return posInDomain;
		 },

		_getPositionForJumping: function(target) {

			var lowestPosition = this._lastClusterPosition,
				highestPosition = this._getLength() - 1;

			if (this._checkDateIsValid(target)) {
				return this._getPositionByDate(target, lowestPosition, highestPosition);
			}

			return this._getPositionForJumpingByCount(target, lowestPosition, highestPosition);
		},

		_getPositionForDeleting: function(target) {

			var lowestPosition = 0,
				highestPosition = this._lastClusterPosition;

			if (this._checkDateIsValid(target)) {
				return this._getPositionByDate(target, lowestPosition, highestPosition);
			}

			return this._getPositionForDeletingByCount(target, lowestPosition, highestPosition);
		},

		_getPositionForJumpingByCount: function(index, lowestPosition, highestPosition) {

			var clusterInfo = this._getClusterIdWhichContainsItem(index, this._itemsReviewedInPrevClusters,
				lowestPosition, highestPosition);

			this._itemsReviewedInPrevClusters = clusterInfo.prevItems;

			return clusterInfo.clusterId;
		},

		_getPositionForDeletingByCount: function(index, lowestPosition, highestPosition) {

			this._lastItemInCluster = 0;

			var clusterInfo = this._getClusterIdWhichContainsItem(index, 0, lowestPosition, highestPosition);

			this._itemsReviewedInPrevClusters = clusterInfo.prevItems;

			return clusterInfo.clusterId;
		},

		_getPositionByDate: function(date, lowestPosition, highestPosition) {

			return this._translateDateToPosition(date, lowestPosition, highestPosition);
		},

		_getClusterIdWhichContainsItem: function(itemOrder, prevItems, from, to) {
			//	summary:
			//		Traduce posiciones de item a posiciones de cluster
			//	itemOrder:
			//		Índice del elemento que estamos buscando
			//	prevItems:
			//		Copia del contador de elementos revisados
			//	from:
			//		Posición de inicio de la búsqueda dentro de los features
			//	to:
			//		Posición de fin de la búsqueda dentro de los features
			//	returns:
			//		Posición del feature (cluster) que contiene al elemento buscado

			for (var i = from; i <= to; i++) {
				var clusterSize = this._getClusterSize(i);

				if (!clusterSize) {
					break;
				}

				var featureItems = clusterSize - this._lastItemInCluster,
					acc = prevItems + featureItems;

				if (itemOrder < acc) {
					// Ya hemos llegado al objetivo y nos sobran items del cluster
					var diff = itemOrder - prevItems;
					prevItems += diff;
					this._lastItemInCluster += diff;
					break;
				} else if (itemOrder > acc) {
					// Cogemos todos los items del cluster y aun nos falta
					prevItems += featureItems;
					this._lastItemInCluster = 0;
				} else {
					// Coincide el máximo con el tamaño del cluster
					prevItems += featureItems;
					this._lastItemInCluster = 0;
					i++;
					break;
				}
			}

			return {
				clusterId: i,
				prevItems: prevItems
			};
		},

		_translateDateToPosition: function(date, from, to) {

			// Si tenemos datos y llega una fecha válida
			if (this._getLength() && this._checkDateIsValid(date)) {
				return this._findLastClusterUntilDate(date, from, to);
			}

			this._banTrack();

			return 0;
		},

		_checkDateIsValid: function(date) {

			return date._isAMomentObject;
		},

		_findLastClusterUntilDate: function(date, from, to) {
			//	summary:
			//		Busca el último cluster disponible en la fecha especificada
			//	date:
			//		Fecha actual, posterior o igual a la fecha de inicio de los clusters que estamos buscando
			//	from:
			//		Posición de inicio de la búsqueda dentro de los features
			//	to:
			//		Posición de fin de la búsqueda dentro de los features
			//	returns:
			//		Posición del feature (cluster) que buscamos

			var lastAxisIndex = this._getLength() - 1,
				lastAxisProps = this._getAxisProps(lastAxisIndex),
				lastEndDate = lastAxisProps.endDate;

			for (var i = from; i <= to; i++) {
				var currentAxisProps = this._getAxisProps(i);
					nextAxisProps = this._getAxisProps(i + 1);

				if (!currentAxisProps) {
					break;
				}

				var currentStartDate = currentAxisProps.startDate,
					currentEndDate = currentAxisProps.endDate,
					nextStartDate = nextAxisProps ? nextAxisProps.startDate : currentEndDate;

				if (date.isBefore(currentStartDate)) {
					// No hay datos todavía, no avanzamos
					this._banTrack();
					return 0;
				}

				if (this._trackIsBanned) {
					this._unbanTrack();
				}

				if (date.isSameOrAfter(lastEndDate)) {
					// No hace falta buscar más, hay que pintar todo
					return lastAxisIndex;
				}

				if (date.isSameOrBefore(nextStartDate)) {
					// Ya hemos llegado al objetivo
					break;
				}
			}

			return i;
		},

		_cleanAndRedraw: function() {

			var lastPosition = this._lastPosition;

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
				axisIds = axisProps && axisProps[this.idsProperty];

			return axisIds || [];
		},

		_getClusterSize: function(i) {

			return this._getClusterIds(i).length;
		},

		_getClustersSize: function() {

			var axesProps = this._getAxesProps();

			if (!axesProps) {
				return 0;
			}

			if (!(axesProps instanceof Array)) {
				return this._getClusterSize(0);
			}

			var clustersSize = 0;
			for (var i = 0; i < axesProps.length; i++) {
				clustersSize += this._getClusterSize(i);
			}

			return clustersSize;
		},

		_getStartDate: function() {

			var firstAxisProps = this._getAxisProps(0);

			return firstAxisProps && firstAxisProps[this.startDatePropName];
		},

		_getEndDate: function() {

			var lastAxisIndex = this._getLength() - 1,
				lastAxisProps = this._getAxisProps(lastAxisIndex);

			return lastAxisProps && lastAxisProps[this.endDatePropName];
		},

		_getClickedIds: function(axesClicked, axes) {

			var axesIds = axes.data(),
				clickedIds = [];

			axesClicked.each(lang.hitch(this, function(d) {

				var axisId = axesIds.indexOf(d),
					pointsIds = this._getClusterIds(axisId);

				clickedIds = clickedIds.concat(pointsIds);
			}));

			return clickedIds;
		}
	});
});
