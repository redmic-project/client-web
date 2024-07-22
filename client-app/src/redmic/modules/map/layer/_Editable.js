define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/query"
	, "RWidgets/Utilities"
	, "redmic/modules/map/layer/_RadiusCommons"
], function(
	declare
	, lang
	, aspect
	, query
	, Utilities
	, _RadiusCommons
){
	return declare(_RadiusCommons, {
		//	summary:
		//		Extensión de MapLayer para editar datos gráficamente.

		constructor: function(args) {

			this.config = {
				editableEvents: {
					DRAG: 'drag',
					DRAW: 'draw',
					SET_CENTER_AND_ZOOM: 'setCenterAndZoom'
				},

				editableActions: {
					DRAG: 'drag',
					DRAGGED: 'dragged',
					DRAW: 'draw',
					DRAWN: 'drawn',
					EDITION: 'edition',
					EDITION_DONE: 'editionDone',
					MOVE: 'move',
					ZOOM_SET: 'zoomSet',
					SET_CENTER_AND_ZOOM: 'setCenterAndZoom',
					CHANGE_PRECISION: 'changePrecision'
				},

				_editionNewItemId: -1,
				_markerDragEvt: 'drag',
				_markerDragEndEvt: 'dragend',
				_zoomForEdition: 9
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_mixEventsAndActions', lang.hitch(this, this._mixEditableEventsAndActions));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineEditableSubscriptions));
			aspect.after(this, '_definePublications', lang.hitch(this, this._defineEditablePublications));
		},

		_mixEditableEventsAndActions: function () {

			lang.mixin(this.events, this.editableEvents);
			lang.mixin(this.actions, this.editableActions);

			delete this.editableEvents;
			delete this.editableActions;
		},

		_defineEditableSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('DRAG'),
				callback: '_subDrag'
			},{
				channel : this.getChannel('DRAW'),
				callback: '_subDraw',
				options: {
					predicate: lang.hitch(this, this._chkDrawGeometry)
				}
			},{
				channel : this.getChannel('EDITION'),
				callback: '_subEdition'
			},{
				channel : this.getChannel('EDITION_DONE'),
				callback: '_subEditionDone'
			},{
				channel : this.getChannel('MOVE'),
				callback: '_subMove',
				options: {
					predicate: lang.hitch(this, this._chkEditionIsActive)
				}
			},{
				channel : this._buildChannel(this.mapChannel, this.actions.ZOOM_SET),
				callback: '_subZoomSet'
			},{
				channel : this.getChannel('CHANGE_PRECISION'),
				callback: '_subChangePrecision',
				options: {
					predicate: lang.hitch(this, this._chkEditionIsActive)
				}
			});
		},

		_defineEditablePublications: function () {

			this.publicationsConfig.push({
				event: 'DRAG',
				channel: this.getChannel('DRAGGED'),
				callback: '_pubDragged'
			},{
				event: 'DRAW',
				channel: this.getChannel('DRAWN'),
				callback: '_pubDrawn'
			},{
				event: 'SET_CENTER_AND_ZOOM',
				channel: this._buildChannel(this.mapChannel, this.actions.SET_CENTER_AND_ZOOM),
				callback: '_pubMapSetCenterAndZoom'
			});
		},

		_subDrag: function(obj) {

			this._enableMarkerDragging(obj[this.idProperty]);
		},

		_chkDrawGeometry: function(obj) {

			return obj.type === 'point';
		},

		_subDraw: function(obj) {

			var id = obj[this.idProperty] || this._editionNewItemId;

			if (id === this._editionNewItemId) {
				this._toggleHiddenInAreaDraw();
			}

			this._enableMarkerDrawing(id);
		},

		_toggleHiddenInAreaDraw: function() {

			var method = 'add',
				nodes;

			if (!this._nodesMeasureArea) {
				this._nodesMeasureArea = query("div.map svg path.layer-measure-resultarea", document);
				nodes = this._nodesMeasureArea;
			} else {
				method = 'remove';
				nodes = this._nodesMeasureArea;
				delete this._nodesMeasureArea;
			}

			for (var i = 0; i < nodes.length; i++) {
				nodes[i].classList[method]('hidden');
			}
		},

		_subEdition: function(req) {

			this._editionMode = true;
			this._onEditionMode(req);
		},

		_onEditionMode: function(req) {

			var itemId = req[this.idProperty],
				item = req.data;

			this.featureId = itemId;

			if (Utilities.isValidUuid(itemId) || Utilities.isValidNumber(itemId)) {
				this._highlightMarkerForEdition(itemId);
			}

			var latLng = this._getFeatureLatLng(itemId),
				radius = this._getFeatureRadius(itemId) || this._getRadiusFromData(item);

			this._drawRadius(this._editionNewItemId, latLng, radius);
		},

		_subEditionDone: function() {

			this._editionMode = false;
			this._onEditionDone();
		},

		_onEditionDone: function() {

			this._clearEditionElements();
			this.featureId = null;
			delete this._layerById[this._editionNewItemId];

			this._eraseRadius(this._editionNewItemId);
			this._editionCircleHasValidRadius = false;
			this._editionCircleHasValidPosition = false;
		},

		_subMove: function(request) {

			this._moveEditionMarker(request);
		},

		_pubDragged: function(channel, evt) {

			var featureId = evt[0],
				newPosition = evt[1],
				distance = evt[2];

			this._publish(channel, {
				featureId: featureId,
				position: newPosition,
				distance: distance
			});
		},

		_pubDrawn: function(channel, evt) {

			if (this._nodesMeasureArea) {
				this._toggleHiddenInAreaDraw();
			}

			var position = evt[0];

			this._publish(channel, {
				position: position
			});
		},

		_pubMapSetCenterAndZoom: function(channel, center) {

			var obj = {
				center: center
			};

			if (!this._lastZoom || this._lastZoom < this._zoomForEdition) {
				obj.zoom = this._zoomForEdition;
			}

			this._publish(channel, obj);
		},

		_chkEditionIsActive: function() {

			return !!this._editionMode;
		},

		_enableMarkerDragging: function(featureId) {

			var oldMarker = this._getMarker(featureId),
				icon = this._getEditionIcon(),
				marker = this._editionMarker;

			if (!marker) {
				if (!oldMarker) {
					return;
				}

				marker = this._createMarker(oldMarker.getLatLng(), icon);
			}

			if (!marker.getPopup()) {
				if (!this._editionMarker) {
					this._editionMarker = marker;
				}

				marker.bindPopup(this.i18n.markerDraggingEnabled, {
					closeOnClick: false
				});

				marker.feature = oldMarker ? oldMarker.feature : null;
				marker.dragging.enable();

				if (oldMarker && oldMarker.feature) {
					this._attenuateOldMarker(oldMarker);
				}

				marker.once(this._markerDragEndEvt, lang.hitch(this, this._onMarkerDragEnd));
			}

			marker.openPopup();

			this._editionMarker.on(this._markerDragEvt, lang.hitch(this, this._onMarkerDrag));
		},

		_getEditionIcon: function() {

			return this._getAwesomeIcon({
				icon: 'star',
				markerColor: 'red',
				prefix: 'fa'
			});
		},

		_onMarkerDrag: function(evt) {

			var mrk = evt.target,
				newPosition = mrk.getLatLng();

			this._handleEditionCircleAfterPositionChange(newPosition);
		},

		_onMarkerDragEnd: function(evt) {

			var mrk = evt.target,
				feature = mrk.feature,
				id = feature ? feature.properties[this.idProperty] : this._editionNewItemId,
				newPosition = mrk.getLatLng(),
				distance = evt.distance;

			mrk.unbindPopup();
			mrk.dragging.disable();
			mrk.off(this._markerDragEvt, lang.hitch(this, this._onMarkerDrag));

			this._emitEvt('DRAG', [id, newPosition, distance]);
		},

		_enableMarkerDrawing: function(featureId) {

			if (!this._drawSubscriber) {
				this._drawSubscriber = this._once(this._buildChannel(this.mapChannel, this.actions.MAP_CLICKED),
					lang.hitch(this, this._subMapClickedEditable, featureId));

				this._emitEvt('COMMUNICATION', {description: this.i18n.markerDrawingEnabled, position: 'top-right'});
			}
		},

		_subMapClickedEditable: function(featureId, res) {

			this._drawSubscriber = null;
			this._onMapClicked(featureId, res);
		},

		_onMapClicked: function(featureId, res) {

			var position = res.latLng,
				icon = this._getEditionIcon(),
				marker = this._createMarker(position, icon);

			this._layerById[featureId] = marker; // OJO, esto es por el -1 de la instancia

			this._editionMarker = marker;
			this._emitEvt('DRAW', [position]);

			this._handleEditionCircleAfterPositionChange(position);
		},

		_highlightMarkerForEdition: function(featureId) {

			var marker = this._getMarker(featureId),
				icon = this._getEditionIcon();

			marker.setIcon(icon);

			this._emitEvt('SET_CENTER_AND_ZOOM', marker.getLatLng());
		},

		_clearEditionElements: function() {

			if (this._editionMarker) {
				this._emitEvt('REMOVE_LAYER', {
					layer: this._editionMarker
				});
				this._editionMarker = null;
			}

			if (this._layerById[this._editionNewItemId]) {
				delete this._layerById[this._editionNewItemId];
			}

			this._editionMarkerLat = null;
			this._editionMarkerLng = null;

			if (this._drawSubscriber) {
				var channel = this._drawSubscriber.channel;
				if (channel) {
					this._unsubscribe(channel.namespace, this._drawSubscriber.id);
				}
				this._drawSubscriber = null;
			}

			var oldMarker = this.featureId ? this._getMarker(this.featureId) : null;
			if (oldMarker) {
				oldMarker.setOpacity(1);
				oldMarker.setIcon(this._getDefaultIcon());
			}
		},

		_moveEditionMarker: function(obj) {

			this._editionMarkerLat = obj.lat || this._editionMarkerLat;
			this._editionMarkerLng = obj.lng || this._editionMarkerLng;

			var latLng = this._getLatLng(this._editionMarkerLat, this._editionMarkerLng);

			if (!this._editionMarker) {
				if (latLng) {
					this._editionMarker = this._createMarker(latLng, this._getEditionIcon());
					this._emitEvt('SET_CENTER_AND_ZOOM', latLng);
				}
			} else {
				if (latLng) {
					this._editionMarker.setLatLng(latLng);
					this._emitEvt('SET_CENTER_AND_ZOOM', latLng);
				}

				var oldMarker = this.featureId ? this._getMarker(this.featureId) : null;
				this._attenuateOldMarker(oldMarker);
			}

			var editionCircle = this._circlesById[this._editionNewItemId];

			if (editionCircle && latLng) {
				editionCircle.setLatLng(latLng);
			}
		},

		_createMarker: function(latlng, icon) {

			var marker = new L.marker(latlng, {
				icon: icon,
				zIndexOffset: 1100
			});

			this._emitEvt('ADD_LAYER', {
				layer: marker
			});

			return marker;
		},

		_attenuateOldMarker: function(oldMarker) {

			oldMarker && oldMarker.setOpacity(0.6);
		},

		_addNewData: function(geoJsonData, moduleContext) {

			this._editionMarker = null;

			this.inherited(arguments);
		},

		_subZoomSet: function(res) {

			this._lastZoom = res.zoom;
		},

		_subChangePrecision: function(req) {

			var id = this._editionNewItemId,
				precision = req.radius;

			if (isNaN(precision)) {
				this._eraseRadius(id);
				this._editionCircleHasValidRadius = false;
			} else {
				this._handleEditionCircleAfterRadiusChange(precision);
			}
		},

		_handleEditionCircleAfterPositionChange: function(position) {

			var circle = this._circlesById[this._editionNewItemId];

			circle && circle.setLatLng(position);

			this._editionCircleHasValidPosition = true;
			this._printEditionCircleIfValid();
		},

		_handleEditionCircleAfterRadiusChange: function(radius) {

			var circle = this._circlesById[this._editionNewItemId];

			circle && circle.setRadius(radius);

			this._editionCircleHasValidRadius = true;
			this._printEditionCircleIfValid();
		},

		_printEditionCircleIfValid: function() {

			if (this._editionCircleHasValidPosition && this._editionCircleHasValidRadius) {
				this._emitEvt('ADD_LAYER', {
					layer: this._circlesById[this._editionNewItemId]
				});
			}
		},

		clear: function() {

			this._onEditionDone();
			this.inherited(arguments);
		}
	});
});
