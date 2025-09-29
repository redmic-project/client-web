define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/dom-class'
	, 'dojo/mouse'
	, 'dojo/on'
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
	, mouse
	, on
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
		//	svgHoverClass: String
		//		Clase que se asigna al elemento svg cuando se pasa el ratón sobre él.
		//	_childHoverClass: String
		//		Clase que se asigna al contenedor de la capa cuando el ratón está sobre ella.
		//	drawFullTrack: Boolean
		//		Flag para dibujar directamente toda la capa.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
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

			var options = {
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

			if (!this._svg) {
				this._createElements();
				this._redraw();
			}
		},

		_createElements: function() {

			this._svg = this._getSvgElement();
			this._svg.attr('class', this.svgClass);

			this._createEventListeners();
		},

		_afterLayerRemoved: function() {

			this._clear();
		},

		_clear: function() {

			this._svg.remove();
			this._svg = null;

			Object.keys(this._trackingLineInstances).forEach((featureId) => {

				const lineInstance = this._trackingLineInstances[featureId],
					lineOwnChannel = lineInstance.getOwnChannel();

				this._publish(lineInstance.getChannel('DESTROY'));

				delete this._trackingLineInstances[featureId];
				delete this._trackingLineInstancesByChannel[lineOwnChannel];

				this._removeSubscriptions(this._subsToLines[lineOwnChannel]);
				delete this._subsToLines[lineOwnChannel];

				this._removePublications(this._pubsToLines[lineOwnChannel]);
				delete this._pubsToLines[lineOwnChannel];
			});
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

		_onZoomStart: function(res) {

			this._emitEvt('LAYER_LOADING');
			this._svg.attr('display', 'none');
			this._removeHoverEffects();
		},

		_onZoomSet: function(zoom, res) {

			this._redraw({
				terms: {
					zoomLevel: zoom
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
				info: info
			});
		}
	});
});
