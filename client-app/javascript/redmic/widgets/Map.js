define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, 'leaflet/leaflet'
	, 'L-areaselect/leaflet-areaselect'
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, L
) {
	return declare([_WidgetBase, Evented], {

		"class": "mapSearch",

		constructor: function(args){

			this.config = {
				urlMapBasemap: "https://atlas.redmic.es/geoserver/basemap/wms",
				layersBasemap: 'Redmic',
				formatBasemap: 'image/jpeg',
				latCenter: 28.5,
				lonCenter: -15.7,
				zoom: 5,
				widthAreaSelect: 250,
				heightAreaSelect: 120,
				events: {
					CHANGE: "change",
					QUERY_MAP: "queryMap",
					REQUEST_QUERY: "requestQuery",
					ADD_LAYER: "addLayer",
					UPDATE_BOUNDS: "updateBounds",
					RESET: "reset",
					RESIZE_COMPLETE: "resizeComplete",
					CENTER: "center"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.REQUEST_QUERY, this._changeSelection);
			this.on(this.events.ADD_LAYER, this._addLayer);
			this.on(this.events.UPDATE_BOUNDS, this._setBoundsAreaSelect);
			this.on(this.events.RESET, this._reset);
			this.on(this.events.CENTER, this._center);
		},

		postCreate: function() {

			this.inherited(arguments);

			// initialize map
			this.map = L.map(this.domNode, {
				doubleClickZoom: false,
				attributionControl: false,
				minZoom: 1,
				crs: L.CRS.EPSG4326,
				maxBounds: L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))
			});

			this._center();
			this._addLayerBase();
			// initialize areaSelect
			this._addAreaSelect();
		},

		_center: function() {

			this.map.setView([this.latCenter, this.lonCenter], this.zoom);
		},

		_addLayerBase: function() {

			if (this.urlMapBasemap) {
				var obj = {
					urlMap: this.urlMapBasemap,
					layers: this.layersBasemap,
					format: this.formatBasemap,
					tiled: true,
					transparent: false
				};

				this._addLayer(obj);
			}
		},

		_addAreaSelect: function() {

			// Add it to the map
			this.areaSelect = L.areaSelect({
				width: this.widthAreaSelect,
				height: this.heightAreaSelect
			});

			this.areaSelect.addTo(this.map);

			// Get a callback when the bounds change
			this.areaSelect.on(this.events.CHANGE, lang.hitch(this, this._changeSelection));
		},

		_addLayer: function(obj) {

			if (obj.tiled === undefined) {
				obj.tiled = false;
			}

			this.layerMap = L.tileLayer.wms(obj.urlMap, {
				layers: obj.layers,
				format: obj.format,
				tiled: obj.tiled,
				transparent: obj.transparent,
				noWrap: true,
				uppercase: true
			}).addTo(this.map);
		},

		_setBoundsAreaSelect: function(bounds) {

			this._setBounds(bounds);
		},

		_setBounds: function(bounds) {

			var size = this.map.getSize();

			if (!bounds._northEast && !bounds._southWest) {
				return;
			}

			var topRight = this.map.latLngToContainerPoint(bounds._northEast);
			var bottomLeft =  this.map.latLngToContainerPoint(bounds._southWest);

			bottomLeft.x = Math.round((bottomLeft.x - (size.x - this.widthAreaSelect) / 2));
			topRight.y = Math.round(topRight.y - ((size.y - this.heightAreaSelect) / 2));
			topRight.x = size.x + bottomLeft.x;
			bottomLeft.y = size.y + topRight.y;

			var sw = this.map.containerPointToLatLng(bottomLeft);
			var ne = this.map.containerPointToLatLng(topRight);

			this.map.fitBounds(new L.LatLngBounds(sw, ne), {});
		},

		_changeSelection: function() {

			clearTimeout(this.timeoutHandler);
			this.timeoutHandler = setTimeout(lang.hitch(this, this.emit, this.events.QUERY_MAP,
				this.areaSelect.getBounds()), 300);
		},

		resize: function() {

			this.map.invalidateSize(true);

			var size = this.map.getSize();

			if (size.x && size.y && (!this._lastSize || (this._lastSize.x !== size.x || this._lastSize.y !== size.y))) {
				this._lastSize = size;
				this.emit(this.events.RESIZE_COMPLETE);
			}
		},

		_reset: function() {

			this.map.removeLayer(this.layerMap);
			this._addLayerBase();

			this.map.setView([this.latCenter, this.lonCenter], this.zoom);
		}
	});
});