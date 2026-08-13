define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
	, 'src/component/mapLayer/MapLayer'
	, 'src/component/mapLayer/mixin/_D3Expansion'
	, 'src/component/mapLayer/mixin/_D3MapProjection'
	, 'src/component/mapLayer/detection/DetectionLine'
], function(
	declare
	, Deferred
	, MapLayer
	, _D3Expansion
	, _D3MapProjection
	, DetectionLine
) {

	return declare([MapLayer, _D3Expansion, _D3MapProjection], {
		// summary:
		//   Implementación de capa para datos de detección (por ejemplo, acústica).
		// description:
		//   Permite consumir y representar datos de detecciones registradas en estaciones.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'detectionLayer',
				events: {
					ADD_FEATURES: 'addFeatures',
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
				},

				svgClass: 'trackingSvg',
				elementPropName: 'element',
				elementIdPropName: 'uuid'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this.getChannel('GO_TO_POSITION'),
				callback: '_subGoToPosition',
				options: {
					predicate: () => this._chkLayerAdded()
				}
			},{
				channel: this.getChannel('SHOW_DIRECTION_MARKERS'),
				callback: '_subShowDirectionMarkers'
			},{
				channel: this.getChannel('HIDE_DIRECTION_MARKERS'),
				callback: '_subHideDirectionMarkers'
			});
		},

		_initialize: function() {

			this.inherited(arguments);

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

			console.log('entran features', features)
			this._addFeaturesToDetectionLine(features);

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

		_addFeaturesToDetectionLine: function(features) {

			if (!this._detectionLineInstance) {
				this._detectionLineInstance = this._createDetectionLine();
				this._subscribeToDetectionLine();
				this._preparePublicationsToDetectionLine();
			}

			this._emitEvt('ADD_FEATURES', {
				data: features
			});
		},

		_createDetectionLine: function() {

			return new DetectionLine({
				parentChannel: this.getChannel(),
				fillColor: this.fillColor,
				svg: this._svg,
				pathGenerator: this._pathGenerator,
				mapChannel: this.mapChannel
			});
		},

		_subscribeToDetectionLine: function() {

			this._subsToLine = this._setSubscriptions([{
				channel: this._detectionLineInstance.getChannel('DRAWN'),
				callback: '_subDetectionLineDrawn'
			},{
				channel: this._detectionLineInstance.getChannel('GOT_CLICKED_POINTS_IDS'),
				callback: '_subGotDetectionLineClickedPointsIds'
			},{
				channel: this._detectionLineInstance.getChannel('DATA_BOUNDS_UPDATED'),
				callback: '_subDataBoundsUpdated'
			}]);
		},

		_preparePublicationsToDetectionLine: function() {

			this._pubsToLine = this._setPublications([{
				event: 'ADD_FEATURES',
				channel: this._detectionLineInstance.getChannel('ADD_DATA')
			},{
				event: 'GO_TO_POSITION',
				channel: this._detectionLineInstance.getChannel('DRAW_UNTIL_POSITION')
			},{
				event: 'REDRAW',
				channel: this._detectionLineInstance.getChannel('REDRAW')
			},{
				event: 'ADJUST_POSITION',
				channel: this._detectionLineInstance.getChannel('ADJUST_POSITION')
			},{
				event: 'SHOW_DIRECTION_MARKERS',
				channel: this._detectionLineInstance.getChannel('SHOW_DIRECTION_MARKERS')
			},{
				event: 'HIDE_DIRECTION_MARKERS',
				channel: this._detectionLineInstance.getChannel('HIDE_DIRECTION_MARKERS')
			},{
				event: 'GET_CLICKED_POINTS_IDS',
				channel: this._detectionLineInstance.getChannel('GET_CLICKED_POINTS_IDS')
			}]);
		},

		_drawUntilPosition: function(req) {

			this._getDetectionLineDrawnDfd().then(lineBounds => this._onDetectionLineDrawn(lineBounds));
			this._emitEvt('GO_TO_POSITION', req);
		},

		_subDetectionLineDrawn: function(res) {

			this._drawnDfd.resolve(res.bounds);
		},

		_subGotDetectionLineClickedPointsIds: function(res) {

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
			if (!this._detectionLineInstance && !this._dfdDataAvailable.isResolved()) {
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

		_getDetectionLineDrawnDfd: function() {

			this._drawnDfd = new Deferred();

			return this._drawnDfd;
		},

		_getDetectionLineClickedPointsIdsDfd: function() {

			this._gotPointsDfd = new Deferred();

			return this._gotPointsDfd;
		},

		_onDetectionLineDrawn: function(lineBounds) {

			const transform = 'translate(' + lineBounds.left + ',' + lineBounds.top + ')',
				height = lineBounds.bottom - lineBounds.top,
				width = lineBounds.right - lineBounds.left;

			this._emitEvt('ADJUST_POSITION', lineBounds);

			this._svg
				.attr('transform', transform)
				.attr('width', width)
				.attr('height', height)
				.attr('display', null);

			this._emitEvt('LAYER_LOADED');
		},

		_afterLayerRemoved: function() {

			this._clear();
		},

		_clear: function() {

			this._svg.remove();
			this._svg = null;
			this._dfdDataAvailable = null;

			this._clearDetectionLine();
		},

		_clearDetectionLine: function() {

			this._publish(this._detectionLineInstance.getChannel('DESTROY'));

			delete this._detectionLineInstance;

			this._removeSubscriptions(this._subsToLine);
			delete this._subsToLine;

			this._removePublications(this._pubsToLine);
			delete this._pubsToLine;
		}
	});
});
