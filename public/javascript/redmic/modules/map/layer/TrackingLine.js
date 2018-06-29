define([
	'd3/d3.min'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/mouse'
	, 'dojo/on'
	, 'leaflet/leaflet'
	, 'redmic/modules/base/_Module'
	, 'RWidgets/Utilities'
	, './_TrackingDataManagement'
	, './_TrackingMarkersManagement'
], function(
	d3
	, declare
	, lang
	, Deferred
	, mouse
	, on
	, L
	, _Module
	, Utilities
	, _TrackingDataManagement
	, _TrackingMarkersManagement
){
	return declare([_Module, _TrackingDataManagement, _TrackingMarkersManagement], {
		//	summary:
		//		Módulo para representar gráficamente los datos que componen una línea de tracking.

		//	svg: Object
		//		Contenedor SVG proporcionado por la capa a la que pertenece el track.
		//	pathGenerator: Object
		//		Generador de ruta para elemento path, proporcionado por la capa a la que pertenece el track.
		//	transitionDuration: Number
		//		Duración en milisegundos de la transición de dibujado del track.
		//	transitionEase: Object
		//		Tipo de transición de dibujado del track.
		//	groupClass: String
		//		Clase que se asigna al elemento g.
		//	groupHoverClass: String
		//		Clase que se asigna al elemento g cuando el ratón pasa por encima.
		//	lineClass: String
		//		Clase que se asigna al elemento path.
		//	banClass: String
		//		Clase para asignar al contenedor del track cuando no está autorizado para mostrarse.
		//	fillColor: String
		//		Color de relleno de los ejes.
		//	trailLength: Integer
		//		Longitud del rastro de dibujado del track. Valor 0 para no dibujar rastro, valor nulo o indefinido para
		//		dibujar el rastro completo.
		//	_lastPosition: Integer
		//		Posición a la que nos han mandado en el paso anterior
		//	_pathTransition: Object
		//		Referencia a la transición actual para poder cancelarla si fuese necesario.
		//	_trackIsBanned: Boolean
		//		Indica si el track ha sido desautorizado para mostrarse.

		constructor: function(args) {

			this.config = {
				idProperty: 'uuid',
				idsProperty: 'uuids',
				transitionDuration: 1000,
				transitionEase: d3.easeLinear,
				groupClass: 'trackingLineGroup',
				groupHoverClass: 'onHover',
				lineClass: 'trackingPath',
				banClass: 'hidden',
				fillColor: 'orange',
				trailLength: null,

				_lastPosition: 0,
				_pathTransition: null,

				ownChannel: 'trackingLine',
				events: {
					DRAWN: 'drawn',
					GOT_CLICKED_POINTS_IDS: 'gotClickedPointsIds',
					DATA_BOUNDS_UPDATED: 'dataBoundsUpdated'
				},
				actions: {
					ADD_DATA: 'addData',
					DRAW_UNTIL_POSITION: 'drawUntilPosition',
					DRAWN: 'drawn',
					REDRAW: 'redraw',
					ADJUST_POSITION: 'adjustPosition',
					GET_CLICKED_POINTS_IDS: 'getClickedPointsIds',
					GOT_CLICKED_POINTS_IDS: 'gotClickedPointsIds',
					DATA_BOUNDS_UPDATED: 'dataBoundsUpdated'
				}
			};

			lang.mixin(this, this.config, args);
		},

		_mixEventsAndActions: function() {

			lang.mixin(this.events, this.trackingBaseEvents);
			lang.mixin(this.actions, this.trackingBaseActions);

			delete this.trackingBaseEvents;
			delete this.trackingBaseActions;
		},

		_defineSubscriptions: function() {

			var options = {
				predicate: lang.hitch(this, this._chkDataIsAdded)
			};

			this.subscriptionsConfig.push({
				channel: this.getChannel('ADD_DATA'),
				callback: '_subAddData'
			},{
				channel: this.getChannel('DRAW_UNTIL_POSITION'),
				callback: '_subDrawUntilPosition',
				options: options
			},{
				channel: this.getChannel('REDRAW'),
				callback: '_subRedraw',
				options: options
			},{
				channel: this.getChannel('ADJUST_POSITION'),
				callback: '_subAdjustPosition',
				options: options
			},{
				channel: this.getChannel('GET_CLICKED_POINTS_IDS'),
				callback: '_subGetClickedPointsIds',
				options: options
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'DRAWN',
				channel: this.getChannel('DRAWN')
			},{
				event: 'GOT_CLICKED_POINTS_IDS',
				channel: this.getChannel('GOT_CLICKED_POINTS_IDS')
			},{
				event: 'DATA_BOUNDS_UPDATED',
				channel: this.getChannel('DATA_BOUNDS_UPDATED')
			});
		},

		_createElements: function() {

			this._group = this.svg.append('svg:g')
				.attr('class', this.groupClass);

			this._createDefinitions();

			this._line = this._createLine();
			this._circleGroup = this._createCircleGroup();

			this._createEventListeners();
		},

		_createEventListeners: function() {

			this._onEnterCallback && this._onEnterCallback.remove();
			this._onLeaveCallback && this._onLeaveCallback.remove();

			var gNode = this._group.node();

			this._onEnterCallback = on(gNode, mouse.enter, lang.hitch(this, this._addHoverEffects));
			this._onLeaveCallback = on(gNode, mouse.leave, lang.hitch(this, this._removeHoverEffects));
		},

		_addHoverEffects: function() {

			this._group
				.attr('class', this.groupClass + ' ' + this.groupHoverClass)
				.moveToFront();
		},

		_removeHoverEffects: function() {

			this._group.attr('class', this.groupClass);
		},

		_createLine: function() {

			return this._group.append('svg:path')
				.attr('class', this.lineClass)
				.attr('marker-start', this._getMarkerSelector('start'));
		},

		_getLatLng: function(lat, lng) {

			if (lat && lng) {
				return new L.latLng(lat, lng);
			}
		},

		_subAddData: function(req) {

			this._clear();
			this._addData(req.data);
			this._publishDataBounds();
		},

		_publishDataBounds: function() {

			var bounds = this._getDataBounds();
			bounds.lineId = this.getOwnChannel();

			this._emitEvt('DATA_BOUNDS_UPDATED', bounds);
		},

		_subRedraw: function() {

			this._removeHoverEffects();
			this._removeExistingAxes();
			this._cleanAndRedraw();
		},

		_subDrawUntilPosition: function(req) {

			var position = req.position,
				animate = req.animate,
				positionInDomain = this._getPositionInDomain(position);

			this._drawUntilPosition(positionInDomain, animate);
		},

		_drawUntilPosition: function(position, animate) {

			var steps = position;
			if (Utilities.isValidNumber(this._lastPosition)) {
				steps -= this._lastPosition;
			}

			var clusterPosition;
			if (steps < 0) {
				clusterPosition = this._jumpToPast(position);
			} else {
				clusterPosition = this._jumpToFuture(position, animate);
			}

			this._lastPosition = position;
			this._lastClusterPosition = clusterPosition;
		},

		_subAdjustPosition: function(req) {

			var globalLeft = req.left,
				globalTop = req.top;

			this._adjustPosition(-globalLeft, -globalTop);
		},

		_subGetClickedPointsIds: function(req) {

			var clickedPoint = req.clickedPoint,
				filterCbk = lang.partial(this._filterAxesOutsideClickedArea, {
					self: this,
					clickedPoint: clickedPoint
				}),
				axes = this._circleGroup.selectAll('circle'),
				axesClicked = axes.filter(filterCbk);

			if (!axesClicked.size()) {
				this._emitClickedPointsIds();
				return;
			}

			var clickedIds = this._getClickedIds(axesClicked, axes);
			this._emitClickedPointsIds(clickedIds);
		},

		_jumpToPast: function(pos) {

			var endPosition = this._getPositionForDeleting(pos),
				startPosition = this._getStartPositionForJumping(endPosition),
				modifiedFeature = this._buildLineStringFeatureInRange(startPosition, endPosition);

			this._createFullTrack(modifiedFeature);

			return endPosition;
		},

		_jumpToFuture: function(pos, animate) {

			var endPosition = this._getPositionForJumping(pos),
				startPosition = this._getStartPositionForJumping(endPosition),
				modifiedFeature = this._buildLineStringFeatureInRange(startPosition, endPosition);

			if (this._lastClusterPosition) {
				this._createTrackBySteps(modifiedFeature, animate);
			} else {
				this._createFullTrack(modifiedFeature, animate);
			}

			return endPosition;
		},

		_getStartPositionForJumping: function(endPosition) {

// TODO esto debe devolver tantos clusters atrás, no puntos simples!!
			if (!Utilities.isValidNumber(this.trailLength)) {
				return 0;
			}

			var distance = endPosition - this.trailLength;

			return distance < 0 ? 0 : distance;
		},

		_createFullTrack: function(lineStringFeature, /*Boolean?*/ animate) {

			var callback = this._applyData(lineStringFeature),
				ret = callback();

			if (animate) {
				this._removeExistingAxes();
				ret = this._updateFullDrawingWithAnimation(lineStringFeature, this._line.node().getTotalLength());
			} else {
				this._line.interrupt();
				this._updateDrawingWithoutAnimation(lineStringFeature);
			}

			return ret;
		},

		_applyData: function(lineStringFeature) {

			this._line.datum(lineStringFeature);

			return lang.hitch(this, this._drawTrack, lineStringFeature);
		},

		_updateFullDrawingWithAnimation: function(lineStringFeature, lineLength) {

			var featureLength = this._getLength(lineStringFeature),
				duration = this.transitionDuration / featureLength,
				lengthAt = this._calculatePathSublengths(lineStringFeature),
				dfd = new Deferred();

			this._line
				.attr('stroke-dasharray', lineLength + ' ' + lineLength)
				.attr('stroke-dashoffset', lineLength);

			this._createAxis(lineStringFeature, 0);
			this._updatePositionMarker({
				lineStringFeature: lineStringFeature,
				// TODO esta posición debe comenzar donde empiece el rastro, no en 0, revisar!!
				pos: 0
			});

			this._pathTransition = this._line;

			for (var i = 1; i < featureLength; i++) {
				var isLast = i === featureLength - 1;

				this._animatePath(i, {
					feature: lineStringFeature,
					offset: lengthAt[i - 1] || 0,
					duration: duration,
					dfd: isLast && dfd
				});
			}

			return dfd;
		},

		_animatePath: function(position, args) {

			var feature = args.feature,
				offset = args.offset,
				duration = args.duration,
				dfd = args.dfd;

			this._pathTransition = this._pathTransition.transition()
				.duration(duration)
				.ease(this.transitionEase)
				.on('start', lang.hitch(this, this._onTransitionStart, {
					lineStringFeature: feature,
					pos: position,
					animate: true,
					duration: duration
				}))
				.on('interrupt', lang.hitch(this, this._onTransitionInterrupt, {
					feature: feature,
					index: position,
					duration: duration
				}))
				.on('end', lang.hitch(this, this._onTransitionEnd, {
					feature: feature,
					index: position,
					dfd: dfd
				}))
				.attr('stroke-dashoffset', offset);
		},

		_onTransitionStart: function(args) {

			this._updatePositionMarker(args);
		},

		_onTransitionInterrupt: function(args) {

			var feature = args.feature,
				index = args.index,
				duration = args.duration;

			this._createAxis(feature, index, true);

			this._updatePositionMarker({
				lineStringFeature: feature,
				pos: index,
				duration: duration
			});
		},

		_onTransitionEnd: function(args) {

			var feature = args.feature,
				index = args.index,
				dfd = args.dfd;

			this._createAxis(feature, index, true);
			this._reorderPositionMarker();

			dfd && dfd.resolve();
		},

		_updateDrawingWithoutAnimation: function(lineStringFeature) {

			this._line
				.attr('stroke-dasharray', 0)
				.attr('stroke-dashoffset', 0);

			var position = this._getLength(lineStringFeature) - 1;
			this._updatePositionMarker({
				lineStringFeature: lineStringFeature,
				pos: position
			});

			this._removeExistingAxes();
			this._createAxes(lineStringFeature);
			this._reorderPositionMarker();
		},

		_createTrackBySteps: function(lineStringFeature, /*Boolean?*/ animate) {

			var callback = this._applyData(lineStringFeature),
				lineLengthBefore = this._line.node().getTotalLength(),
				ret = callback();

			if (animate) {
				var lineLength = this._line.node().getTotalLength();
				ret = this._updateDrawingStepWithAnimation(lineStringFeature, lineLengthBefore, lineLength);
			} else {
				this._line.interrupt();
				this._updateDrawingWithoutAnimation(lineStringFeature);
			}

			return ret;
		},

		_updateDrawingStepWithAnimation: function(lineStringFeature, lineLengthBefore, lineLengthAfter) {

			var lengthAt = this._calculatePathSublengths(lineStringFeature, this._lastClusterPosition),
				dashOffset = lengthAt[0] || 0;

			this._line
				.attr('stroke-dasharray', lineLengthAfter + ' ' + lineLengthAfter)
				.attr('stroke-dashoffset', dashOffset);

			var lastIndex = this._getLength(lineStringFeature) - 1,
				remainingCount = lengthAt.length,
				startIndex = this._lastClusterPosition ? 1 : 0,
				endIndex = remainingCount + (this._lastClusterPosition ? 0 : 1),
				duration = this.transitionDuration / (endIndex || 1),
				dfd = new Deferred();

			this._pathTransition = this._line;

			for (var i = startIndex; i <= endIndex; i++) {
				var currentPosition = this._lastClusterPosition + i,
					isLast = currentPosition === lastIndex;

				this._animatePath(currentPosition, {
					feature: lineStringFeature,
					offset: lengthAt[i] || 0,
					duration: duration,
					dfd: isLast && dfd
				});
			}

			return dfd;
		},

		_calculatePathSublengths: function(lineStringFeature, /*Integer?*/ start) {

			var lengthAt = [],
				lineData = this._getCoordinates(lineStringFeature);

			for (var i = start || 1; i < lineData.length - 1; i++) {
				var path = this.svg.append('svg:path')
					.datum({
						type: 'Feature',
						geometry: {coordinates: lineData.slice(i), type: 'LineString'}
					})
					.attr('d', this.pathGenerator)
					.attr('visibility', 'hidden');

				lengthAt.push(path.node().getTotalLength());
				path.remove();
			}

			return lengthAt;
		},

		_getPointForCoordinatesAt: function(lineStringFeature, /*Integer?*/ pos) {

			if (!lineStringFeature) {
				return;
			}

			var coords = this._getCoordinates(lineStringFeature),
				i = Utilities.isValidNumber(pos) ? pos : coords.length - 1,
				coord = coords[i];

			if (!coord || !this.mapInstance) {
				return;
			}

			return this.mapInstance.latLngToLayerPoint(this._getLatLng(coord[1], coord[0]));
		},

		_drawTrack: function(lineStringFeature) {

			var dfd = new Deferred(),
				boundsWithOffset = this._getBoundsWithOffset(lineStringFeature);

			this._adjustPosition(-boundsWithOffset.left, -boundsWithOffset.top);

			dfd.then(lang.hitch(this, this._emitEvt, 'DRAWN', {
				bounds: boundsWithOffset,
				id: this.getOwnChannel()
			}));

			this._line.attr('d', this.pathGenerator);
			dfd.resolve();

			return dfd;
		},

		_adjustPosition: function(left, top) {

			var transform = 'translate(' + left + ',' + top + ')';
			this._group && this._group.attr('transform', transform);
		},

		_getBoundsWithOffset: function(lineStringFeature) {

			var bounds = this.pathGenerator.bounds(lineStringFeature),
				topLeft = bounds[0],
				bottomRight = bounds[1];

			return {
				top: topLeft[1] - this._positionOffset,
				left: topLeft[0] - this._positionOffset,
				bottom: bottomRight[1] + this._positionOffset,
				right: bottomRight[0] + this._positionOffset
			};
		},

		_emitClickedPointsIds: function(pointsIds) {

			this._emitEvt('GOT_CLICKED_POINTS_IDS', {
				id: this.getOwnChannel(),
				pointsIds: pointsIds
			});
		},

		_banTrack: function() {

			if (this._trackIsBanned) {
				return;
			}

			// TODO al banear la línea de track, se podría desconectar parcialmente para que deje de calcularse, pensar
			this._trackIsBanned = true;
			this._group.attr('class', this.banClass);
		},

		_unbanTrack: function() {

			if (!this._trackIsBanned) {
				return;
			}

			this._trackIsBanned = false;
			this._group.attr('class', this.groupClass);
		},

		_clear: function() {

			this._lastPosition = 0;
			this._pathTransition = null;
		}
	});
});
