define([
	'd3'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/Deferred'
	, 'dojo/dom-class'
	, 'dojo/mouse'
	, 'dojo/on'
	, 'dojo/promise/all'
	, 'src/component/map/layer/TrackingLine'
	, 'RWidgets/Utilities'
	, './_D3Expansion'
	, './MapLayer'
], function(
	d3
	, declare
	, lang
	, aspect
	, Deferred
	, domClass
	, mouse
	, on
	, all
	, TrackingLine
	, Utilities
	, _D3Expansion
	, MapLayer
){
	return declare([MapLayer, _D3Expansion], {
		//	summary:
		//		Implementación de capa para datos de tipo tracking.
		//	description:
		//		Permite consumir y representar datos de uno o más tracks.

		//	svgClass: String
		//		Clase que se asigna al elemento svg.
		//	svgHoverClass: String
		//		Clase que se asigna al elemento svg cuando se pasa el ratón sobre él.
		//	_childHoverClass: String
		//		Clase que se asigna al contenedor de la capa cuando el ratón está sobre ella.
		//	drawFullTrack: Boolean
		//		Flag para dibujar directamente toda la capa.

		constructor: function(args) {

			this.config = {
				svgClass: 'trackingSvg',
				svgHoverClass: 'onHover',
				_childHoverClass: 'childIsOnHover',

				drawFullTrack: false,

				_trackingLineInstances: {},
				_trackingLineInstancesByChannel: {},
				_subsToLines: {},
				_pubsToLines: {},

				_elementPropName: 'element',
				_elementIdPropName: 'uuid',

				ownChannel: 'trackingLayer',

				trackingLayerEvents: {
					GO_TO_POSITION: 'goToPosition',
					REDRAW: 'redraw',
					ADJUST_POSITION: 'adjustPosition',
					SHOW_DIRECTION_MARKERS: 'showDirectionMarkers',
					HIDE_DIRECTION_MARKERS: 'hideDirectionMarkers',
					GET_CLICKED_POINTS_IDS: 'getClickedPointsIds'
				},
				trackingLayerActions: {
					DRAW_ALL: 'drawAll',
					GO_TO_POSITION: 'goToPosition',
					SHOW_DIRECTION_MARKERS: 'showDirectionMarkers',
					HIDE_DIRECTION_MARKERS: 'hideDirectionMarkers',
					ZOOM_SET: 'zoomSet',
					ZOOM_START: 'zoomStart',
					DATA_BOUNDS_UPDATED: 'dataBoundsUpdated'
				}
			};

			lang.mixin(this, this.config, args);

			this._expandD3(d3);

			aspect.before(this, '_mixEventsAndActions', lang.hitch(this, this._mixTrackingLayerEventsAndActions));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineTrackingLayerSubscriptions));
		},

		_mixTrackingLayerEventsAndActions: function() {

			lang.mixin(this.events, this.trackingLayerEvents);
			lang.mixin(this.actions, this.trackingLayerActions);

			delete this.trackingLayerEvents;
			delete this.trackingLayerActions;
		},

		_defineTrackingLayerSubscriptions: function() {

			var options = {
				predicate: lang.hitch(this, this._chkLayerAdded)
			};

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.mapChannel, this.actions.ZOOM_START),
				callback: '_subZoomStart',
				options: options
			},{
				channel: this._buildChannel(this.mapChannel, this.actions.ZOOM_SET),
				callback: '_subZoomSet',
				options: options
			},{
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

			var transform = d3.geoTransform({
				point: lang.partial(function(self, x, y) {

					self._projectPoint(x, y, self._mapInstance, this.stream);
				}, this)
			});

			this._pathGenerator = d3.geoPath(transform);
		},

		_projectPoint: function(x, y, map, stream) {

			var point = map.latLngToLayerPoint(this._getLatLng(y, x));
			stream.point(point.x, point.y);
		},

		_getLatLng: function(lat, lng) {

			if (lat && lng) {
				return new L.latLng(lat, lng);
			}
		},

		_afterLayerAdded: function() {

			if (!this._svg) {
				this._createElements();
				this._redraw();
			}
		},

		_createElements: function() {

			this._svg = d3.select(this._mapInstance.getPanes().overlayPane)
				.append('svg:svg')
					.attr('class', this.svgClass);

			this._createEventListeners();
		},

		_afterLayerRemoved: function() {

			//this.clear();
			this._svg.remove();
			this._svg = null;
		},

		_createEventListeners: function() {

			this._onEnterCallback && this._onEnterCallback.remove();
			this._onLeaveCallback && this._onLeaveCallback.remove();

			var svgNode = this._svg.node();

			this._onEnterCallback = on(svgNode, mouse.enter, lang.hitch(this, this._addHoverEffects));
			this._onLeaveCallback = on(svgNode, mouse.leave, lang.hitch(this, this._removeHoverEffects));
		},

		_addHoverEffects: function() {

			var svgNode = this._svg.node(),
				svgParentNode = svgNode && svgNode.parentNode;

			svgParentNode && domClass.add(svgParentNode, this._childHoverClass);

			this._svg
				.attr('class', this.svgClass + ' ' + this.svgHoverClass)
				.moveToFront();
		},

		_removeHoverEffects: function() {

			var svgNode = this._svg.node(),
				svgParentNode = svgNode && svgNode.parentNode;

			svgParentNode && domClass.remove(svgParentNode, this._childHoverClass);

			this._svg.attr('class', this.svgClass);
		},

		_addNewData: function(geoJsonData, moduleContext) {

			if (geoJsonData.features) {
				this._svg && this.addData(geoJsonData, this);
			} else {
				console.error('Unexpected data format', geoJsonData);
			}
		},

		addData: function(featureCollection) {

			var features = featureCollection.features;

			for (var i = 0; i < features.length; i++) {
				var feature = features[i],
					geometry = feature.geometry,
					geometryType = geometry && geometry.type;

				if (geometryType === 'LineString' || geometryType === 'Point') {
					this._addFeatureToTrackingLine(feature);
				} else {
					console.error('Geometries received are not valid');
					return;
				}
			}

			if (this._dfdDataAvailable && !this._dfdDataAvailable.isFulfilled()) {
				this._dfdDataAvailable.resolve();
			}

			var position;
			if (this._lastPosition !== undefined) {
				position = this._lastPosition;
			} else {
				position = this.drawFullTrack ? Number.POSITIVE_INFINITY : 0;
			}

			this._drawUntilPosition({
				position: position
			});
		},

		_addFeatureToTrackingLine: function(feature) {

			var featureId = this._getFeatureId(feature),
				lineInstance = this._trackingLineInstances[featureId];

			if (!lineInstance) {
				lineInstance = this._createTrackingLine();
				var lineId = lineInstance.getOwnChannel();

				this._trackingLineInstances[featureId] = lineInstance;
				this._trackingLineInstancesByChannel[lineId] = lineInstance;

				this._subscribeToTrackingLine(lineInstance, lineId);
				this._preparePublicationsToTrackingLine(lineInstance, lineId);
			}

			this._publish(lineInstance.getChannel('ADD_DATA'), {
				data: feature
			});
		},

		_getFeatureId: function(feature) {

			var props = feature && feature.properties,
				element = props && props[this._elementPropName];

			return element && element[this._elementIdPropName];
		},

		_createTrackingLine: function() {

			return new TrackingLine({
				parentChannel: this.getChannel(),
				fillColor: this.fillColor,	// TODO este y otros parámetros seteables desde fuera, deberían pasarse en un objeto para mezclar
				svg: this._svg,
				pathGenerator: this._pathGenerator,
				mapInstance: this._mapInstance
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

			this._getAllDrawnDfd().then(lang.hitch(this, this._onTrackingLinesDrawn));
			this._lastPosition = req.position;

			this._emitEvt('GO_TO_POSITION', req);
		},

		_subTrackingLineDrawn: function(res) {

			var bounds = res.bounds,
				lineId = res.id,
				dfd = this._drawnDfds[lineId];

			dfd.resolve(bounds);
		},

		_subGotTrackingLineClickedPointsIds: function(res) {

			var pointsIds = res.pointsIds || [],
				lineId = res.id,
				dfd = this._gotClickedPointsIdsDfds[lineId];

			dfd.resolve(pointsIds);
		},

		_subDataBoundsUpdated: function(res) {

			res.layerId = this.getOwnChannel();
			this._publish(this.getChannel('DATA_BOUNDS_UPDATED'), res);
		},

		_chkLayerAdded: function() {

			return !!this._mapInstance && !!this._svg;
		},

		_subShowDirectionMarkers: function() {

			this._emitEvt('SHOW_DIRECTION_MARKERS');
		},

		_subHideDirectionMarkers: function() {

			this._emitEvt('HIDE_DIRECTION_MARKERS');
		},

		_subGoToPosition: function(req) {

			this._emitEvt('LAYER_LOADING');

			if (!Object.keys(this._trackingLineInstances).length) {
				if (!this._dfdDataAvailable || this._dfdDataAvailable.isFulfilled()) {
					this._dfdDataAvailable = new Deferred();
				}
				this._dfdDataAvailable.then(lang.hitch(this, this._drawUntilPosition, req));
			} else {
				this._drawUntilPosition(req);
			}
		},

		_subZoomStart: function(res) {
// TODO unificar con listenZoom

			this._onZoomStart(res);
		},

		_onZoomStart: function(res) {

			this._emitEvt('LAYER_LOADING');
			this._svg.attr('display', 'none');
			this._removeHoverEffects();
		},

		_subZoomSet: function(res) {
// TODO unificar con listenZoom

			this._onZoomSet(res);
		},

		_onZoomSet: function(res) {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					terms: {
						zoomLevel: res.zoom
					}
				}
			});
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

			var dfds = {};

			for (var lineId in this._trackingLineInstancesByChannel) {
				var dfd = new Deferred();
				dfds[lineId] = dfd;
			}

			return dfds;
		},

		_onTrackingLinesDrawn: function(linesBounds) {

			var bounds = this._getGlobalBounds(linesBounds),
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

			var minTop = Number.POSITIVE_INFINITY,
				minLeft = Number.POSITIVE_INFINITY,
				maxBottom = Number.NEGATIVE_INFINITY,
				maxRight = Number.NEGATIVE_INFINITY;

			for (var lineId in linesBounds) {
				var lineBounds = linesBounds[lineId],
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

		_requestLayerInfo: function(res) {

			var clickedPoint = res.layerPoint;

			if (!clickedPoint || !this._svg || !this._checkPointIsInsideLayer(clickedPoint)) {
				this._emitLayerInfo();
				return;
			}

			this._getAllClickedPointsIdsGotDfd().then(lang.hitch(this, this._onGotTrackingLinesClickedPointsIds));

			this._emitEvt('GET_CLICKED_POINTS_IDS', {
				clickedPoint: clickedPoint
			});
		},

		_checkPointIsInsideLayer: function(point) {

			var x = point.x,
				y = point.y,
				width = Number.parseFloat(this._svg.attr('width')),
				height = Number.parseFloat(this._svg.attr('height')),

				// TODO si hay más transformaciones, puede que no haya que coger el primer item, sino buscar su índice
				svgTranslateTransform = this._svg.node().transform.baseVal[0].matrix,
				topLeftX = svgTranslateTransform.e,
				topLeftY = svgTranslateTransform.f,
				bottomRightX = topLeftX + width,
				bottomRightY = topLeftY + height;

			return x > topLeftX && x < bottomRightX && y > topLeftY && y < bottomRightY;
		},

		_onGotTrackingLinesClickedPointsIds: function(resolvedPointsIds) {

			var idsToRequest = [];

			for (var key in resolvedPointsIds) {
				var linePointsIds = resolvedPointsIds[key];
				idsToRequest = idsToRequest.concat(linePointsIds);
			}

			this._requestItems(idsToRequest, this.infoTarget || this.target);
		},

		_requestItems: function(ids, target) {

			if (!ids || !ids.length) {
				this._emitLayerInfo();
				return;
			}

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: target,
				action: '_mget',
				query: {
					ids: ids
				},
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
				info: info
			});
		}
	});
});
