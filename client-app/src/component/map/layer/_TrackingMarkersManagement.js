define([
	'd3'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'RWidgets/Utilities'
], function(
	d3
	, declare
	, lang
	, aspect
	, Utilities
){
	return declare(null, {
		//	summary:
		//		Extensión de la línea de tracking para gestionar sus distintos marcadores.

		//	axesRadius: Number
		//		Radio de los ejes (puntos) del track.
		//	axesRadiusMultiplier: Number
		//		Multiplicador del radio de los ejes para obtener el radio de los mismos durante la animación al
		//		crearlos.
		//	clusterAxesRadiusMultiplier: Number
		//		Multiplicador del radio de los ejes, para obtener el radio del eje que representa a un cluster.
		//	axesGrowingTransitionDuration: Number
		//		Duración de la transición de crecimiento los ejes, aplicada en su creación.
		//	axesShrinkingTransitionDuration: Number
		//		Duración de la transición de encogimiento de los ejes, aplicada tras su crecimiento.
		//	circleGroupClass: String
		//		Clase que se asigna al grupo que contiene a los elementos circle.
		//	startMarkerClass: String
		//		Clase que se asigna al marcador de posición inicial.
		//	currentPositionClass: String
		//		Clase que se asigna al eje de posición actual.
		//	endPositionClass: String
		//		Clase que se asigna al eje de posición actual al finalizar el track.
		//	markerClass: String
		//		Clase que se asigna a los marcadores de dirección y sentido.
		//	_positionOffset: Number
		//		Margen de la posición del svg para no recortar nunca el dibujo.
		//	_positionMarker: Object
		//		Elemento del marcador de posición actual.
		//	_defsElementPrefix: String
		//		Prefijo usado en los ids de los marcadores.
		//	_defsElementIdSeparator: String
		//		Separador usado en los prefijos de los ids de los marcadores.

		//	_defsData: Array
		//		Definiciones de los distintos marcadores disponibles.
		_defsData: [{
			name: 'arrow',
			path: 'M0,0 m-3,-3 L7,0 L-3,3 Z',
			viewbox: '-3 -3 10 6'
		},{
			name: 'plane',
			path: 'M0,0 L-3,-5 L7,0 L-3,5 Z',
			viewbox: '-3 -5 10 10'
		},{
			name: 'stub',
			path: 'M0,0 m-1,-5 L1,-5 L1,5 L-1,5 Z',
			viewbox: '-1 -5 2 10'
		},{
			name: 'square',
			path: 'M0,0 m-5,-5 L5,-5 L5,5 L-5,5 Z',
			viewbox: '-5 -5 10 10'
		}],

		constructor: function(args) {

			this._trackingMarkersConfig = {
				axesRadius: 4,
				axesRadiusMultiplier: 2.5,
				clusterAxesRadiusMultiplier: 1.5,
				axesGrowingTransitionDuration: 300,
				axesShrinkingTransitionDuration: 500,
				circleGroupClass: 'trackingAxesGroup',
				startMarkerClass: 'trackingStartPosition',
				currentPositionClass: 'trackingCurrentPosition',
				endPositionClass: 'endOfTrack',
				markerClass: 'trackMarker',

				_positionMarker: null,
				_defsElementPrefix: 'trackMarker',
				_defsElementIdSeparator: '_',

				trackingMarkersManagementEvents: {
				},
				trackingMarkersManagementActions: {
					SHOW_DIRECTION_MARKERS: 'showDirectionMarkers',
					HIDE_DIRECTION_MARKERS: 'hideDirectionMarkers'
				}
			};

			lang.mixin(this, this._trackingMarkersConfig, args);

			this._positionOffset = this.axesRadius * this.axesRadiusMultiplier * this.clusterAxesRadiusMultiplier;

			aspect.before(this, '_mixEventsAndActions', lang.hitch(this,
				this._mixTrackingMarkersManagementEventsAndActions));

			aspect.after(this, '_defineSubscriptions', lang.hitch(this,
				this._defineTrackingMarkersManagementSubscriptions));

			aspect.after(this, '_clear', lang.hitch(this, this._clearTrackingMarkersManagement));
		},

		_mixTrackingMarkersManagementEventsAndActions: function() {

			lang.mixin(this.events, this.trackingMarkersManagementEvents);
			lang.mixin(this.actions, this.trackingMarkersManagementActions);

			delete this.trackingMarkersManagementEvents;
			delete this.trackingMarkersManagementActions;
		},

		_defineTrackingMarkersManagementSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('SHOW_DIRECTION_MARKERS'),
				callback: '_subShowDirectionMarkers',
				options: {
					predicate: lang.hitch(this, function() {

						return this._chkDataIsAdded() && this._chkMarkersCanBeShown();
					})
				}
			},{
				channel: this.getChannel('HIDE_DIRECTION_MARKERS'),
				callback: '_subHideDirectionMarkers',
				options: {
					predicate: lang.hitch(this, function() {

						return this._chkDataIsAdded() && !this._chkMarkersCanBeShown();
					})
				}
			});
		},

		_createDefinitions: function() {

			var defs = this._group.append('svg:defs'),
				markerSize = this.axesRadius * 2;

			defs.selectAll('marker')
				.data(this._defsData)
				.enter()
					.append('svg:marker')
						.attr('id', lang.hitch(this, function(d) { return this._getMarkerId(d.name); }))
						.attr('class', this.markerClass)
						.attr('fill', this.fillColor)
						.attr('markerHeight', markerSize)
						.attr('markerWidth', markerSize)
						.attr('orient', 'auto')
						.attr('viewBox', function(d) { return d.viewbox; })
						.append('svg:path')
							.attr('d', function(d) { return d.path; });

			this._createStartMarker(defs);
		},

		_createCircleGroup: function() {

			return this._group.append('svg:g')
				.attr('class', this.circleGroupClass)
				.attr('fill', this.fillColor);
		},

		_createStartMarker: function(defs) {

			var startMarkerSize = this.axesRadius * this.axesRadiusMultiplier,
				startMarkerRadius = startMarkerSize / 2,
				startMarkerViewBox = -startMarkerRadius + ' ' + -startMarkerRadius + ' ' + startMarkerSize + ' ' +
					startMarkerSize;

			defs.append('svg:marker')
				.attr('id', this._getMarkerId('start'))
				.attr('class', this.startMarkerClass)
				.attr('markerHeight', startMarkerSize)
				.attr('markerWidth', startMarkerSize)
				.attr('viewBox', startMarkerViewBox)
				.append('svg:circle')
					.attr('r', startMarkerRadius);
		},

		_getMarkerId: function(name) {

			return this._defsElementPrefix + this._defsElementIdSeparator + name + this._defsElementIdSeparator +
				this.getOwnChannel();
		},

		_getMarkerSelector: function(name) {

			var markerId = this._getMarkerId(name);

			return 'url(#' + markerId + ')';
		},

		_createCircleMarker: function(args) {

			var point = args.point,
				radius = args.radius,
				id = args.id,
				className = args.className,

				circle = this._circleGroup.append('svg:circle')
					.data([id])
					.attr('r', radius)
					.attr('transform', 'translate(' + point.x + ',' + point.y + ')');

			className && circle.attr('class', className);
			this._axesAreHidden && circle.attr('opacity', 0);

			return circle;
		},

		_animateCircle: function(circle, radius) {

			var circleStyle = getComputedStyle(circle.node()),
				strokeWidth = parseInt(circleStyle['stroke-width'], 10),
				growingDuration = this.axesGrowingTransitionDuration;

			circle.transition()
				.duration(growingDuration)
				.attr('r', radius * this.axesRadiusMultiplier - strokeWidth)
				.transition()
					.duration(this.axesShrinkingTransitionDuration)
					.delay(growingDuration * 2)
					.attr('r', radius);
		},

		_getAxisRadius: function(pos) {

			var clusterSize = this._getClusterSize(pos);

			if (!clusterSize) {
				return 0;
			}

			if (clusterSize > 1) {
				return this.axesRadius * this.clusterAxesRadiusMultiplier;
			}

			return this.axesRadius;
		},

		_updatePositionMarker: function(args) {

			var lineStringFeature = args.lineStringFeature,
				pos = args.pos,
				animate = args.animate,
				duration = args.duration,
				lastPoint = this._getPointForCoordinatesAt(lineStringFeature, pos);

			if (!lastPoint) {
				return;
			}

			if (!this._positionMarker) {
				this._createPositionMarker(lastPoint);
			} else {
				this._updateExistingPositionMarker({
					lineStringFeature: lineStringFeature,
					pos: pos,
					animate: animate,
					duration: duration || this.transitionDuration,
					lastPoint: lastPoint
				});
			}

		},

		_createPositionMarker: function(point) {

			this._positionMarker = this._createCircleMarker({
				point: point,
				radius: this.axesRadius * this.axesRadiusMultiplier,
				id: 'position',
				className: this.currentPositionClass
			});
		},

		_updateExistingPositionMarker: function(args) {

			var pos = args.pos,
				animate = args.animate,
				duration = args.duration,
				lastPoint = args.lastPoint,

				pointId = this._getIdByPosition(pos),
				firstPointId = this._getIdByPosition(0),
				lastPointId = this._getIdByPosition(),

				callback = lang.hitch(this, this._onPositionMarkerUpdated, pointId, firstPointId, lastPointId),
				posMarker = this._positionMarker;

			if (animate) {
				posMarker = posMarker.transition()
					.duration(duration)
					.ease(this.transitionEase)
					.on('interrupt', lang.hitch(this, this._onPositionMarkerUpdateInterrupted))
					.on('end', callback);
			} else {
				posMarker.interrupt();
				callback();
			}

			posMarker.attr('transform', 'translate(' + lastPoint.x + ',' + lastPoint.y + ')');
		},

		_onPositionMarkerUpdated: function(currentId, firstId, lastId) {

			if (!this._positionMarker) {
				return;
			}

			var className = this.currentPositionClass;

			if (currentId === lastId) {
				className += ' ' + this.endPositionClass;
			}

			this._positionMarker.attr('class', className);
		},

		_onPositionMarkerUpdateInterrupted: function() {

			this._updatePositionMarker({
				lineStringFeature: this._lineStringFeature,
				pos: this._lastClusterPosition
			});
		},

		_reorderPositionMarker: function() {

			if (!this._positionMarker) {
				return;
			}

			var markerSelector = d3.select(this._positionMarker);

			markerSelector
				.moveToFront()
				.moveDown();
		},

		_chkMarkersCanBeShown: function() {

			return !this._axesAreHidden;
		},

		_createAxes: function(lineStringFeature) {

			var coords = this._getCoordinates(lineStringFeature);

			if (coords.length === 2) {
				coords = Utilities.uniq(coords);
			}

			for (var i = 0; i < coords.length; i++) {
				this._createAxis(lineStringFeature, i, false);
			}
		},

		_removeExistingAxes: function() {

			this._circleGroup && this._circleGroup.selectAll('circle')
				.filter(lang.partial(this._filterExistingAxes, this))
				.remove();
		},

		_filterExistingAxes: function(self, d, i) {

			return !self._positionMarker || this !== self._positionMarker.node();
		},

		_createAxis: function(lineStringFeature, /*Integer?*/ pos, animate) {

			var point = this._getPointForCoordinatesAt(lineStringFeature, pos),
				id = this._getIdByPosition(pos);

			if (!point) {
				return;
			}

			var radiusValue = this._getAxisRadius(pos),
				radius = animate ? 0 : radiusValue,
				circle = this._createCircleMarker({
					point: point,
					radius: radius,
					id: id
				});

			animate && radiusValue && this._animateCircle(circle, radiusValue);
		},

		_filterAxesOutsideClickedArea: function(args, d, i) {

			var self = args.self,
				clickedPoint = args.clickedPoint;

			if (self._positionMarker && this === self._positionMarker.node()) {
				return;
			}

			var rAttr = this.getAttributeNode('r'),
				threshold = rAttr ? parseFloat(rAttr.value) + 1 : 0,
				translation = self._getAxisTranslation(this),

				x = clickedPoint.x,
				y = clickedPoint.y,
				maxX = translation.x + threshold,
				maxY = translation.y + threshold,
				minX = translation.x - threshold,
				minY = translation.y - threshold;

			return x >= minX && x <= maxX && y >= minY && y <= maxY;
		},

		_getAxisTranslation: function(axis) {

			var item = d3.select(axis),
				// TODO si hay más transformaciones, puede que no haya que coger el primer item, sino buscar su índice
				itemTranslateTransform = item.node().transform.baseVal[0].matrix;

			return {
				x: itemTranslateTransform.e,
				y: itemTranslateTransform.f
			};
		},

		_subShowDirectionMarkers: function() {

			this._axesAreHidden = true;

			this._circleGroup.selectAll('circle').style('opacity', 0);

			this._line
				.attr('marker-mid', this._getMarkerSelector('arrow'))
				.attr('marker-end', this._getMarkerSelector('square'));
		},

		_subHideDirectionMarkers: function() {

			this._axesAreHidden = false;

			this._circleGroup.selectAll('circle').style('opacity', 1);

			this._line
				.attr('marker-mid', null)
				.attr('marker-end', null);
		},

		_clearTrackingMarkersManagement: function() {

			this._removeExistingAxes();

			this._positionMarker && this._positionMarker.remove();
			this._positionMarker = null;
		}
	});
});
