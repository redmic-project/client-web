define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'leaflet/leaflet'
	, 'pruneCluster/PruneCluster.amd.min'
	, "templates/LoadingArrows"
	, "./_AnimateMarker"
	, "./_PruneClusterLayerItfc"
	, "./MapLayer"

	, 'awesome-markers/leaflet.awesome-markers.min'
], function(
	declare
	, lang
	, aspect
	, L
	, PruneClusterModule
	, LoadingTemplate
	, _AnimateMarker
	, _PruneClusterLayerItfc
	, MapLayer
){
	return declare([MapLayer, _PruneClusterLayerItfc, _AnimateMarker], {
		//	summary:
		//		Implementación de capa pruneCluster.
		//	description:
		//		Proporciona la fachada para trabajar con capas pruneCluster.

		constructor: function(args) {

			this.config = {
				ownChannel: 'pruneClusterLayer',
				geoJsonData: null,
				pointToLayer: null,
				geoJsonStyle: null,
				_layerById: {},
				_markerById: {},
				_fakeMarkers: {},
				_afterClusteringTimeout: 200,
				defaultIconConfig: {
					icon: 'star',
					markerColor: 'orange',
					prefix: 'fa'
				},

				mergeSize: 60,
				mergeMargin: 20,
				categoryStyle: 'donut',
				colors: ['orange', 'red', 'blue', 'pink', 'beige', 'gray', 'cadetblue'],
				icons: [],
				defaultColor: 'orange',
				defaultIcon: 'star',
				defaultPopupContent: LoadingTemplate(),
				bindPopupToMarkers: true
			};

			lang.mixin(this, this.config, args);

			aspect.around(this, '_selectExistingPointMarker', lang.hitch(this, this._aroundSelectExistingPointMarker));
		},

		_initialize: function() {

			this.layer = new PruneClusterModule.PruneClusterForLeaflet(this.mergeSize, this.mergeMargin);

			this.layer.BuildLeafletClusterIcon = this._buildClusterIcon;
			aspect.after(this.layer, 'PrepareLeafletMarker', lang.hitch(this, this._prepareMarker));
			aspect.after(this.layer, 'ProcessView', lang.hitch(this, this._prepareAfterClusterEvaluation));

			this._defineClusterMarker();
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CLICK', lang.hitch(this, this._onMarkerClick));
		},

		_buildClusterIcon: function(cluster) {

			var e = new L.Icon.MarkerCluster();

			e.stats = cluster.stats;
			e.population = cluster.population;
			return e;
		},

		_buildMarkerIcon: function(data, markerCategory) {

			return this._getAwesomeIcon({
				icon: this.icons[markerCategory] || this.defaultIcon,
				markerColor: this.colors[markerCategory] || this.defaultColor,
				prefix: 'fa'
			});
		},

		_prepareMarker: function(originalReturn, args) {

			var marker = args[0],
				markerData = args[1];

			this._onEachFeature(markerData, marker);
		},

		_onEachFeature: function(markerData, marker) {

			var layerId = markerData[this.idProperty],
				feature = markerData.feature;

			// Si el marcador no estaba añadido al mapa anteriormente
			if (marker._leaflet_id === undefined) {
				this._completeNewMarker(marker, markerData);
				this._layerById[layerId] = marker;
			}

			this.onEachFeature(feature, marker);
		},

		_completeNewMarker: function(marker, markerData) {

			var markerId = markerData[this.idProperty],
				evtData = {
					layer: marker,
					data: markerData
				};

			marker.category = markerData.category;
			marker.idProperty = markerId;
			marker.feature = markerData.feature;

			marker
				.on('click', lang.hitch(this, this._emitEvt, 'CLICK', evtData))
				.on('preclick', lang.hitch(this, this._emitEvt, 'PRE_CLICK', evtData));
		},

		_prepareAfterClusterEvaluation: function() {

			clearTimeout(this._afterClusteringTimeoutHandler);
			this._afterClusteringTimeoutHandler = setTimeout(lang.hitch(this, this._afterClustering),
				this._afterClusteringTimeout);
		},

		_defineClusterMarker: function() {

			var options = {
					className: 'prunecluster leaflet-markercluster-icon'
				},
				drawFunc;

			if (this.categoryStyle === 'donut') {
				options.iconSize = new L.Point(44, 44);
				drawFunc = this._drawDonut;
			} else if (this.categoryStyle === 'bubbles') {
				options.iconSize = new L.Point(48, 48);
				drawFunc = this._drawBubbles;
			}

			L.Icon.MarkerCluster = L.Icon.extend({
				colors: this.colors,

				options: options,

				createIcon: function () {

					var e = document.createElement('canvas');
					this._setIconStyles(e, 'icon');
					var s = this.options.iconSize;
					e.width = s.x;
					e.height = s.y;
					this.draw(e.getContext('2d'), s.x, s.y);
					return e;
				},

				createShadow: function () {

					return null;
				},

				draw: drawFunc
			});
		},

		_drawDonut: function(canvas, width, height) {

			var start = 0;
			for (var i = 0, l = this.colors.length; i < l; ++i) {

				var size = this.stats[i] / this.population;

				if (size > 0) {
					canvas.beginPath();
					canvas.moveTo(22, 22);
					canvas.fillStyle = this.colors[i];
					var from = start + 0.14,
						to = start + size * Math.PI * 2;

					if (to < from) {
						from = start;
					}
					canvas.arc(22,22,22, from, to);

					start = start + size * Math.PI * 2;
					canvas.lineTo(22,22);
					canvas.fill();
					canvas.closePath();
				}
			}

			canvas.beginPath();
			canvas.fillStyle = 'white';
			canvas.arc(22, 22, 18, 0, Math.PI * 2);
			canvas.fill();
			canvas.closePath();

			canvas.fillStyle = '#555';
			canvas.textAlign = 'center';
			canvas.textBaseline = 'middle';
			canvas.font = 'bold 12px sans-serif';

			canvas.fillText(this.population, 22, 22, 40);
		},

		_drawBubbles: function(canvas, width, height) {

			var start = 0;
			for (var i = 0, l = this.colors.length; i < l; ++i) {

				var size = this.stats[i] / this.population;


				if (size > 0) {

					canvas.beginPath();

					var angle = Math.PI/4*i;
					var posx = Math.cos(angle) * 18, posy = Math.sin(angle) * 18;

					var xa = 0, xb = 1, ya = 4, yb = 8;

					var r = ya + size * (yb - ya);

					canvas.arc(24+posx,24+posy, r, 0, Math.PI * 2);
					canvas.fillStyle = this.colors[i];
					canvas.fill();
					canvas.closePath();
				}
			}

			canvas.beginPath();
			canvas.fillStyle = 'white';
			canvas.arc(24, 24, 16, 0, Math.PI * 2);
			canvas.fill();
			canvas.closePath();

			canvas.fillStyle = '#555';
			canvas.textAlign = 'center';
			canvas.textBaseline = 'middle';
			canvas.font = 'bold 12px sans-serif';

			canvas.fillText(this.population, 24, 24, 48);
		},

		_getDefaultIcon: function(marker) {

			var obj = this.defaultIconConfig;

			obj.markerColor = this.colors[marker.category] || this.defaultColor;

			return this._getAwesomeIcon(obj);
		},

		_getAwesomeIcon: function(config) {

			return L.AwesomeMarkers.icon(config);
		},

		_getMarker: function(marker) {

			if (typeof marker !== 'object')
				return this._layerById[marker];
			return marker;
		},

		_isMarkerSelectable: function(marker) {

			return !!marker._mapToAdd;
		},

		_getLatLng: function(lat, lng) {

			if (lat && lng)
				return new L.latLng(lat, lng);
		},

		_addNewData: function(geoJsonData, moduleContext) {

			if (!geoJsonData.features) {
				return;
			}

			this.addData(geoJsonData.features);
		},

		addData: function(data) {

			for (var i = 0; i < data.length; i++) {
				var feature = data[i],
					lat = feature.geometry.coordinates[1],
					lng = feature.geometry.coordinates[0],
					marker = new PruneClusterModule.PruneCluster.Marker(lat, lng),
					markerId = feature[this.idProperty];

				marker.data.feature = feature;
				marker.data[this.idProperty] = markerId;
				marker.category = this.getMarkerCategory(feature);
				marker.data.category = marker.category;

				marker.data.icon = lang.hitch(this, this._buildMarkerIcon);
				marker.data.popup = this.defaultPopupContent;
				marker.data.popupOptions = {
					autoPan: false
				};

				this._markerById[markerId] = marker;

				this.layer.RegisterMarker(marker);
			}

			this.layer.ProcessView();
		},

		getMarkerCategory: function(feature) {

			return 0;
		},

		_onMarkerClick: function(evt) {

			if (this.bindPopupToMarkers) {
				this._setPopupContent(evt.layer, evt.data);
			}
		},

		_setPopupContent: function(marker, data) {

			var popup = marker.getPopup();

			if (!popup) {
				marker.bindPopup(this.defaultPopupContent).openPopup();
				popup = marker.getPopup();
			}

			if (!popup.getContent() || popup.getContent() === this.defaultPopupContent) {
				var popupContent = this.getPopupContent(data);
				if (popupContent.then) {
					popupContent.then(lang.hitch(this, function(data, value) {
						this._markerById[data.feature[this.idProperty]].data.popup = value;
						popup.setContent(value);
					}, data));
				} else {
					this._markerById[data.feature[this.idProperty]].data.popup = popupContent;
					popup.setContent(popupContent);
				}
			}
		},

		getPopupContent: function(data) {

			return JSON.stringify(data, null, ' ');
		},

		_aroundSelectExistingPointMarker: function(originalMethod) {

			return lang.hitch(this, function(method, marker, id) {

				this._unclusterizeMarker(id);
				var fakeMarker = this._fakeMarkers[id];

				return method(fakeMarker, id);
			}, lang.hitch(this, originalMethod));
		},

		_selectNonexistingMarker: function(markerId) {

			var cluster = this._getMarkerInCluster(markerId);

			if (!cluster) {
				if (cluster === 0) {
					console.error("Tried to find marker '" + markerId + "', but it is not inside any cluster");
				}

				return;
			}

			this._unclusterizeMarker(markerId);
			var fakeMarker = this._fakeMarkers[markerId];

			if (this._isMarkerSelectable(fakeMarker)) {
				this._selectExistingMarker(fakeMarker, markerId);
			}
		},

		_getMarkerInCluster: function(markerId) {

			var clusters = this.layer.Cluster._clusters,
				pruneClusterMarker = this._markerById[markerId];

			if (!pruneClusterMarker || !clusters || !clusters.length) {
				return;
			}

			for (var i = 0; i < clusters.length; i++) {
				var cluster = clusters[i];

				if (!cluster.population) {
					continue;
				}

				var clusterBounds = cluster.bounds,
					southWest = [clusterBounds.minLng, clusterBounds.minLat],
					northEast = [clusterBounds.maxLng, clusterBounds.maxLat],
					bounds = L.latLngBounds(southWest, northEast),
					markerData = pruneClusterMarker.data,
					dataPosition = markerData.feature.geometry.coordinates,
					fitBounds = bounds.contains(dataPosition);

				if (!fitBounds) {
					continue;
				}

				return cluster;
			}

			return 0;
		},

		_unclusterizeMarker: function(markerId) {

			var pruneClusterMarker = this._markerById[markerId],
				markerData = pruneClusterMarker.data,
				feature = markerData.feature,
				dataPosition = feature.geometry.coordinates;

			if (pruneClusterMarker) {
				this._setPruneClusterMarkerFiltering(pruneClusterMarker, true);
			}

			if (!this._fakeMarkers[markerId]) {
				this._fakeMarkers[markerId] = this._createFakeMarker(dataPosition, markerData);
			}
		},

		_setPruneClusterMarkerFiltering: function(marker, filtered) {

			marker.filtered = filtered;
			this.layer.ProcessView();
		},

		_createFakeMarker: function(position, markerData) {

			var positionReversed = [position[1], position[0]],
				feature = markerData.feature,
				mapInstance = this.layer._mapToAdd,
				fakeMarker = new L.marker(positionReversed)
					.addTo(mapInstance);

			this._completeNewMarker(fakeMarker, markerData);
			this.onEachFeature(feature, fakeMarker);

			return fakeMarker;
		},

		_deselectNonexistingMarker: function(markerId) {

			this._clusterizeMarker(markerId);
		},

		_clusterizeMarker: function(markerId) {

			var pruneClusterMarker = this._markerById[markerId],
				fakeMarker = this._fakeMarkers[markerId],
				mapInstance = this.layer._mapToAdd;

			if (fakeMarker) {
				fakeMarker.removeFrom(mapInstance);
				delete this._fakeMarkers[markerId];
			}

			if (pruneClusterMarker) {
				this._setPruneClusterMarkerFiltering(pruneClusterMarker, false);
			}
		},

		_getMarkerById: function(id) {

			if (this._layerById && this._layerById[id]) {
				return this._layerById[id];
			}

			if (this._fakeMarkers && this._fakeMarkers[id]) {
				return this._fakeMarkers[id];
			}
		},

		clear: function() {

			this.layer.RemoveMarkers();
			this.layer.ProcessView();
		},

		_animateMarker: function(req) {

			var ret = this.inherited(arguments);

			if (ret) {
				return ret;
			}

			var markerId = req.markerId,
				cluster = this._getMarkerInCluster(markerId);

			if (cluster) {
				var icon = cluster.data._leafletMarker._icon;

				this._initAnimateMarker(icon);
			}
		},

		_setCenter: function(obj) {

			var markerId = obj.markerId,
				layer = this._getMarkerById(markerId),
				objEmit = {
					options: obj.options
				};

			if (layer) {
				objEmit.center = layer.getLatLng();
			} else {
				layer = this._getMarkerInCluster(markerId);
				objEmit.center = layer.averagePosition;
			}

			this._emitEvt('SET_CENTER', objEmit);
		}
	});
});
