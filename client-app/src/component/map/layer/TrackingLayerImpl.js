define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/dom-class'
	, 'dojo/promise/all'
	, 'src/component/map/layer/_D3Expansion'
	, 'src/component/map/layer/_D3MapProjection'
	, 'src/component/map/layer/MapLayer'
	, 'src/component/map/layer/TrackingLine'
], function(
	declare
	, lang
	, Deferred
	, domClass
	, all
	, _D3Expansion
	, _D3MapProjection
	, MapLayer
	, TrackingLine
) {

	return declare([MapLayer, _D3Expansion, _D3MapProjection], {
		//	summary:
		//		Implementación de capa para datos de tipo tracking.
		//	description:
		//		Permite consumir y representar datos de uno o más tracks.

		//	svgClass: String
		//		Clase que se asigna al elemento svg.
		//	drawFullTrack: Boolean
		//		Flag para dibujar directamente toda la capa.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				svgClass: 'trackingSvg',

				drawFullTrack: false,

				_trackingLineInstances: {},
				_trackingLineInstancesByChannel: {},
				_subsToLines: {},
				_pubsToLines: {},

				_elementPropName: 'element',
				_elementIdPropName: 'uuid',

				ownChannel: 'trackingLayer',

				events: {
					GO_TO_POSITION: 'goToPosition',
					REDRAW: 'redraw',
					ADJUST_POSITION: 'adjustPosition',
					SHOW_DIRECTION_MARKERS: 'showDirectionMarkers',
					HIDE_DIRECTION_MARKERS: 'hideDirectionMarkers',
					GET_CLICKED_POINTS_IDS: 'getClickedPointsIds'
				},

				actions: {
					DRAW_ALL: 'drawAll',
					GO_TO_POSITION: 'goToPosition',
					SHOW_DIRECTION_MARKERS: 'showDirectionMarkers',
					HIDE_DIRECTION_MARKERS: 'hideDirectionMarkers',
					DATA_BOUNDS_UPDATED: 'dataBoundsUpdated'
				}
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const options = {
				predicate: lang.hitch(this, this._chkLayerAdded)
			};

			this.subscriptionsConfig.push({
				channel: this.getChannel('GO_TO_POSITION'),
				callback: '_subGoToPosition',
				options: options
			},{
				channel: this.getChannel('SHOW_DIRECTION_MARKERS'),
				callback: '_subShowDirectionMarkers'
			},{
				channel: this.getChannel('HIDE_DIRECTION_MARKERS'),
				callback: '_subHideDirectionMarkers'
			});
		},

		_initialize: function() {

			this._pathGenerator = this._getGeoPath();
		},

		_afterLayerAdded: function() {

			this.inherited(arguments);

			if (!this._svg) {
				this._createElements();
				this._redraw();
			}
		},

		_createElements: function() {

			this._svg = this._getSvgElement();
			this._svg.attr('class', this.svgClass);
		},

		_addNewData: function(geoJsonData) {

			this.addData(geoJsonData);
		},

		addData: function(featureCollection) {

			this._createDataAvailableDfdIfNeeded();

			const features = featureCollection?.features;
			if (!features) {
				console.error('Unexpected data format', featureCollection);
				this._dfdDataAvailable.reject();
				return;
			}

			if (!features.length) {
				this._dfdDataAvailable.reject();
				return;
			}

			features.every(feature => this._addFeatureData(feature));

			if (!this._dfdDataAvailable.isFulfilled()) {
				this._dfdDataAvailable.resolve();
			}
		},

		_createDataAvailableDfdIfNeeded: function() {

			if (this._dfdDataAvailable) {
				return;
			}

			this._dfdDataAvailable = new Deferred();
			this._dfdDataAvailable.then(null, () => this._emitEvt('LAYER_LOADED'));
		},

		_addFeatureData: function(feature) {

			const validGeometryTypes = ['LineString', 'Point'],
				geometryType = feature.geometry?.type;

			if (!validGeometryTypes.includes(geometryType)) {
				console.error('Received feature geometry is not valid', feature);
				this._dfdDataAvailable.reject();
				return false;
			}

			this._addFeatureToTrackingLine(feature);
			return true;
		},

		_addFeatureToTrackingLine: function(feature) {

			const featureId = this._getFeatureId(feature);

			let lineInstance = this._trackingLineInstances[featureId];

			if (!lineInstance) {
				lineInstance = this._createTrackingLine();
				this._trackingLineInstances[featureId] = lineInstance;

				const lineId = lineInstance.getOwnChannel();
				this._trackingLineInstancesByChannel[lineId] = lineInstance;

				this._subscribeToTrackingLine(lineInstance, lineId);
				this._preparePublicationsToTrackingLine(lineInstance, lineId);
			}

			this._publish(lineInstance.getChannel('ADD_DATA'), {
				data: feature
			});
		},

		_getFeatureId: function(feature) {

			return feature?.properties?.[this._elementPropName]?.[this._elementIdPropName];
		},

		_createTrackingLine: function() {

			return new TrackingLine({
				parentChannel: this.getChannel(),
				fillColor: this.fillColor,
				svg: this._svg,
				pathGenerator: this._pathGenerator,
				mapChannel: this.mapChannel
			});
		},

		_subscribeToTrackingLine: function(lineInstance, lineId) {

			this._subsToLines[lineId] = this._setSubscriptions([{
				channel: lineInstance.getChannel('DRAWN'),
				callback: '_subTrackingLineDrawn'
			},{
				channel: lineInstance.getChannel('GOT_CLICKED_POINTS_IDS'),
				callback: '_subGotTrackingLineClickedPointsIds'
			},{
				channel: lineInstance.getChannel('DATA_BOUNDS_UPDATED'),
				callback: '_subDataBoundsUpdated'
			}]);
		},

		_preparePublicationsToTrackingLine: function(lineInstance, lineId) {

			this._pubsToLines[lineId] = this._setPublications([{
				event: 'GO_TO_POSITION',
				channel: lineInstance.getChannel('DRAW_UNTIL_POSITION')
			},{
				event: 'REDRAW',
				channel: lineInstance.getChannel('REDRAW')
			},{
				event: 'ADJUST_POSITION',
				channel: lineInstance.getChannel('ADJUST_POSITION')
			},{
				event: 'SHOW_DIRECTION_MARKERS',
				channel: lineInstance.getChannel('SHOW_DIRECTION_MARKERS')
			},{
				event: 'HIDE_DIRECTION_MARKERS',
				channel: lineInstance.getChannel('HIDE_DIRECTION_MARKERS')
			},{
				event: 'GET_CLICKED_POINTS_IDS',
				channel: lineInstance.getChannel('GET_CLICKED_POINTS_IDS')
			}]);
		},

		_drawUntilPosition: function(req) {

			this._getAllDrawnDfd().then(linesBounds => this._onAllTrackingLinesDrawn(linesBounds));
			this._emitEvt('GO_TO_POSITION', req);
		},

		_subTrackingLineDrawn: function(res) {

			const bounds = res.bounds,
				lineId = res.id,
				dfd = this._drawnDfds[lineId];

			dfd.resolve(bounds);
		},

		_subGotTrackingLineClickedPointsIds: function(res) {

			const pointsIds = res.pointsIds ?? [],
				lineId = res.id,
				dfd = this._gotClickedPointsIdsDfds[lineId];

			dfd.resolve(pointsIds);
		},

		_subDataBoundsUpdated: function(res) {

			res.layerId = this.getOwnChannel();
			this._publish(this.getChannel('DATA_BOUNDS_UPDATED'), res);
		},

		_chkLayerAdded: function() {

			return !!(this._mapInstance && this._svg);
		},

		_subShowDirectionMarkers: function() {

			this._emitEvt('SHOW_DIRECTION_MARKERS');
		},

		_subHideDirectionMarkers: function() {

			this._emitEvt('HIDE_DIRECTION_MARKERS');
		},

		_subGoToPosition: function(req) {

			this._createDataAvailableDfdIfNeeded();

			// Si ya sabemos que esta capa no tendrá datos, se ignora el cambio de posición
			if (this._dfdDataAvailable.isRejected()) {
				this._emitEvt('LAYER_LOADED');
				return;
			}

			this._emitEvt('LAYER_LOADING');

			// Si es posible que lleguen datos posteriormente, posponemos el cambio de posición
			if (!Object.keys(this._trackingLineInstances).length && !this._dfdDataAvailable.isResolved()) {
				this._dfdDataAvailable.then(() => this._drawUntilPosition(req));
				return;
			}

			this._drawUntilPosition(req);
		},

		_onZoomStart: function(res) {

			this._emitEvt('LAYER_LOADING');
			this._svg.attr('display', 'none');
		},

		_onZoomSet: function(zoom, res) {

			if (zoom === this._lastZoomLevel) {
				return;
			}
			this._lastZoomLevel = zoom;

			const query = {
				terms: {
					zoomLevel: zoom
				}
			};

			this._emitEvt('ADD_REQUEST_PARAMS', {
				target: this.target,
				params: {
					query
				}
			});

			this._redraw();
		},

		_getAllDrawnDfd: function() {

			this._drawnDfds = this._getLinesDfds();

			return all(this._drawnDfds);
		},

		_getAllClickedPointsIdsGotDfd: function() {

			this._gotClickedPointsIdsDfds = this._getLinesDfds();

			return all(this._gotClickedPointsIdsDfds);
		},

		_getLinesDfds: function() {

			const dfds = {};

			for (let lineId in this._trackingLineInstancesByChannel) {
				dfds[lineId] = new Deferred();
			}

			return dfds;
		},

		_onAllTrackingLinesDrawn: function(linesBounds) {

			const bounds = this._getGlobalBounds(linesBounds),
				transform = 'translate(' + bounds.left + ',' + bounds.top + ')',
				height = bounds.bottom - bounds.top,
				width = bounds.right - bounds.left;

			this._emitEvt('ADJUST_POSITION', bounds);

			this._svg
				.attr('transform', transform)
				.attr('width', width)
				.attr('height', height)
				.attr('display', null);

			this._emitEvt('LAYER_LOADED');
		},

		_getGlobalBounds: function(linesBounds) {

			let minTop = Number.POSITIVE_INFINITY,
				minLeft = Number.POSITIVE_INFINITY,
				maxBottom = Number.NEGATIVE_INFINITY,
				maxRight = Number.NEGATIVE_INFINITY;

			for (let lineId in linesBounds) {
				const lineBounds = linesBounds[lineId],
					lineTop = lineBounds.top,
					lineLeft = lineBounds.left,
					lineBottom = lineBounds.bottom,
					lineRight = lineBounds.right;

				if (lineTop < minTop) {
					minTop = lineTop;
				}

				if (lineLeft < minLeft) {
					minLeft = lineLeft;
				}

				if (lineBottom > maxBottom) {
					maxBottom = lineBottom;
				}

				if (lineRight > maxRight) {
					maxRight = lineRight;
				}
			}

			return {
				top: minTop,
				left: minLeft,
				bottom: maxBottom,
				right: maxRight
			};
		},

		_afterLayerRemoved: function() {

			this._clear();
		},

		_clear: function() {

			this._svg.remove();
			this._svg = null;
			this._dfdDataAvailable = null;

			Object.keys(this._trackingLineInstances).forEach(featureId => this._clearTrackingLine(featureId));
		},

		_clearTrackingLine: function(featureId) {

			const lineInstance = this._trackingLineInstances[featureId],
				lineOwnChannel = lineInstance.getOwnChannel();

			this._publish(lineInstance.getChannel('DESTROY'));

			delete this._trackingLineInstances[featureId];
			delete this._trackingLineInstancesByChannel[lineOwnChannel];

			this._removeSubscriptions(this._subsToLines[lineOwnChannel]);
			delete this._subsToLines[lineOwnChannel];

			this._removePublications(this._pubsToLines[lineOwnChannel]);
			delete this._pubsToLines[lineOwnChannel];
		},

		_requestLayerInfo: function(res) {

			const clickedPoint = res.layerPoint;

			if (!clickedPoint || !this._svg || !this._checkPointIsInsideLayer(clickedPoint)) {
				this._emitLayerInfo();
				return;
			}

			this._getAllClickedPointsIdsGotDfd().then(clickedPoints =>
				this._onGotTrackingLinesClickedPointsIds(clickedPoints));

			this._emitEvt('GET_CLICKED_POINTS_IDS', {
				clickedPoint
			});
		},

		_checkPointIsInsideLayer: function(point) {

			// TODO si hay más transformaciones, puede que no haya que coger el primer item, sino buscar su índice
			const svgTranslateTransform = this._svg.node().transform.baseVal[0]?.matrix;
			if (!svgTranslateTransform) {
				return false;
			}

			const topLeftX = svgTranslateTransform.e,
				topLeftY = svgTranslateTransform.f;

			const width = Number.parseFloat(this._svg.attr('width')),
				height = Number.parseFloat(this._svg.attr('height')),
				bottomRightX = topLeftX + width,
				bottomRightY = topLeftY + height;

			const x = point.x,
				y = point.y;

			return x > topLeftX && x < bottomRightX && y > topLeftY && y < bottomRightY;
		},

		_onGotTrackingLinesClickedPointsIds: function(resolvedPointsIds) {

			const idsToRequest = [];

			for (let key in resolvedPointsIds) {
				const linePointsIds = resolvedPointsIds[key];
				linePointsIds.forEach(linePointId => idsToRequest.push(linePointId));
			}

			const target = this.infoTarget ?? this.target;
			this._requestItems(idsToRequest, target);
		},

		_requestItems: function(ids, target) {

			if (!ids?.length) {
				this._emitLayerInfo();
				return;
			}

			const path = this.infoTargetPathParams ?? {};

			const query = {
				ids
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: target,
				action: '_mget',
				params: {path, query},
				requesterId: this.getOwnChannel()
			});
		},

		_processLayerInfo: function(data) {

			this._emitLayerInfo(data);
		},

		_emitLayerInfo: function(info) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info
			});
		}
	});
});
