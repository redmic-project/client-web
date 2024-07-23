define([
	"app/designs/base/_Main"
	, "app/designs/externalTextSearchList/Controller"
	, "app/designs/externalTextSearchList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "templates/PlaceNamesList"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "RWidgets/Button"
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, put
	, TemplateList
	, Pagination
	, Total
	, GeoJsonLayerImpl
	, Button
) {

	return declare([Layout, Controller, _Main], {
		//	summary:
		//		main Placename.

		constructor: function(args) {

			this.config = {
				actions: {
					ADD_LAYER: "addLayer",
					SET_CENTER_AND_ZOOM: "setCenterAndZoom",
					REFRESH: "refresh",
					REMOVE_LAYER: "removeLayer",
					GOT_ZOOM: "gotZoom",
					GET_ZOOM: "getZoom",
					ADD_TO_QUERY: "addToQuery"
				},
				events: {
					CLEAR_LAYER: "cleanLayer",
					CLEAR_BROWSER: "clearBrowser",
					REFRESH: "refresh"
				},
				ownChannel: "placeNames",

				_browserTarget: 'browserPlaceNames',

				label: this.i18n.placeNames,
				// General params
				baseTarget: redmicConfig.services.grafcan,
				numPage: 1,
				maxSize: 100,
				idProperty: "id",
				title: this.i18n.placeNames,

				noFixedZoom: false,

				// overflow: Boolean
				// 	Informa sobre si ha habido más resultados que el máximo por página.
				overflow: false

			};

			lang.mixin(this, this.config, args);

			this._resetTarget();
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				idProperty: this.idProperty,
				target: this._browserTarget,
				bars: [{
					instance: Total
				},{
					instance: Pagination
				}],
				template: TemplateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-map-marker",
							btnId: "placeName"
						}]
					}
				},
				queryChannel: this.getChannel()
			}, this.browserConfig || {}]);

			this.textSearchConfig = this._merge([{
				target: this.target,
				itemLabel: this.itemLabel
			}, this.textSearchConfig || {}]);

			this.geoJsonLayerConfig = this._merge([{
				parentChannel: this.getChannel(),
				mapChannel: this.mapChannel,
				onEachFeature: lang.hitch(this, this.onEachFeature),
				markerColor: 'purple',
				markerIconName: 'compass',
				markerIconPrefix: 'fa'
			}, this.geoJsonLayerConfig || {}]);
		},

		_initializeMain: function() {

			this.geoJsonLayer = new GeoJsonLayerImpl(this.geoJsonLayerConfig);
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'CLEAR_LAYER',
				channel: this.geoJsonLayer.getChannel("CLEAR")
			},{
				event: 'CLEAR_BROWSER',
				channel: this.browser.getChannel("CLEAR")
			});
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.browser.getChannel("BUTTON_EVENT"),
				callback: "_subBrowserClick"
			},{
				channel : this.getChannel("ADD_TO_QUERY"),
				callback: "_subAddToQuery"
			});
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onHideStep));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._buildChannel(this.mapChannel, this.actions.ADD_LAYER), this.geoJsonLayer);

			this.clearButton = new Button({
				iconClass: "fa fa-eraser",
				'class': "warning",
				title: this.i18n.clear,
				onClick: lang.hitch(this, this._clearButtonCallback)
			}).placeAt(this.buttonsNode);
		},

		_clearButtonCallback: function(evt) {

			this._emitEvt('CLEAR_LAYER');
		},

		_resetTarget: function() {

			var target = this.baseTarget;

			if (this.numPage !== 0) {
				target += "/" + this.numPage;
			}

			if (this.maxSize !== 0) {
				target += "/" + this.maxSize;
			}

			target += '/';

			this.target = target;
		},

		_beforeShow: function(request) {

			var data = request.data;

			this._publish(this.textSearch.getChannel("SET_DEFAULT"), {
				data: data ? data.toString() : "",
				execute: true
			});
		},

		_subBrowserClick: function(obj) {

			if (obj.btnId === "placeName") {
				var placeName = this._getPlaceName(obj.id);
				placeName && this._drawPlaceName(placeName);
			}
		},

		_getPlaceName: function(id) {

			for (var key in this.placeNames) {
				if (this.placeNames[key].id === id) {
					return this.placeNames[key];
				}
			}
		},

		_drawPlaceName: function(placeName) {

			var lat = parseFloat(placeName.latitud),
				lng = parseFloat(placeName.longitud),
				geoJson = {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [lng, lat]
					},
					properties: placeName
				},
				obj = {
					center: [lat, lng]
				};

			if (!this.noFixedZoom) {
				obj.zoom = 10;

				this._publish(this._buildChannel(this.mapChannel, this.actions.SET_CENTER_AND_ZOOM), obj);
			} else {
				this._once(this._buildChannel(this.mapChannel, this.actions.GOT_ZOOM),
					lang.hitch(this, this._subGotZoom, obj));

				this._publish(this._buildChannel(this.mapChannel, this.actions.GET_ZOOM));
			}

			//this._emitEvt('CLEAR_LAYER');

			this._publish(this.geoJsonLayer.getChannel("ADD_DATA"), {
				data: geoJson
			});
		},

		_subGotZoom: function(obj, req) {

			var zoom = req.zoom;

			if (zoom < 7) {
				obj.zoom = 7;
			}

			this._publish(this._buildChannel(this.mapChannel, this.actions.SET_CENTER_AND_ZOOM), obj);
		},

		onEachFeature: function(feature, layer) {

			var info = put("div"),
				desiredPropsI18n = ["name", "location", "classification", "x", "y"];
				desiredProps = ["nombre", "localizacion", "clasificacion", "x", "y"];

			for (var i = 0; i < desiredProps.length; i++) {
				var key = desiredProps[i],
					data = feature.properties[key];

				if (data) {
					put(info, "b", this.i18n[desiredPropsI18n[i]] + ": ");
					put(info, "span", data);
					put(info, "br");
				}
			}

			put(info, "br");
			var node = put(info, "a", this.i18n.remove + " " + this.i18n.placeName.toLowerCase());
			put(info, "br");

			node.onclick = lang.hitch(this, this._deleteElement, layer);

			layer.bindPopup(info);
		},

		_deleteElement: function(layer) {

			this._publish(this._buildChannel(this.mapChannel, this.actions.REMOVE_LAYER), {
				layer: layer
			});
		},

		_onHideStep: function(evt) {

			this._emitEvt('CLEAR_BROWSER');
			this._publish(this.textSearch.getChannel("RESET"));
		},

		_subAddToQuery: function(res) {

			var query = res.query,
				size = query.size,
				from = query.from;

			if (!size || from === undefined) {
				return;
			}

			this.numPage = (from / size) + 1,
			this.maxSize = size;

			this._resetTarget();
			this._newSearch(this._lastSearch);
		},

		_newSearch: function(obj) {

			if (obj && obj.suggest) {
				return;
			}

			var value = obj.text;

			if (!this._lastSearch || this._lastSearch.text !== value) {
				this._lastSearch = obj;
				this._resetPagination();
			}

			this._findByText(value);
		},

		_findByText: function(value) {

			var params = {
				texto: value
			};

			var targetWithParams = this._generateUrl(params);

			this.target = [this.target, targetWithParams];

			this._emitEvt('GET', {
				target: targetWithParams
			});
		},

		_generateUrl: function(/*Object*/ params) {
			// summary:
			//		Prepara la url con los parámetros de búsqueda.
			// tags:
			//		private
			// params:
			//		Parámetros de búsqueda.

			var query = "";
			for (var key in params) {
				var hasSeveralQuestionMarks = this.target.indexOf("?") !== -1;
				query += (hasSeveralQuestionMarks ? "&" : "?") + key + "=" + params[key];
			}

			return this.target + query;
		},

		_resetPagination: function() {

			if (this.numPage === 1) {
				return;
			}

			this.numPage = 1;
			this._publish(this.browser.getChannel("RESET_PAGINATION"));
			this._resetTarget();
		},

		_itemAvailable: function(res) {

			this.target = this.target[0];

			var responseStatus = res.status,
				responseData = res.data,
				value = responseData.data,
				total = responseData.total,
				urlNext = responseData.urlnext,
				data = [];

			this.overflow = !!urlNext;
			this.placeNames = value;

			for (var key in value) {
				data.push(value[key]);
			}

			this._emitEvt("SEND_DATA", {
				res: {
					data: data,
					total: total,
					status: responseStatus
				},
				target: this._browserTarget
			});
		},

		_errorAvailable: function(error) {

			this.target = this.target[0];

			this._emitEvt('COMMUNICATION', {
				type: "alert",
				level: "error",
				description: this.i18n.timeoutMessage
			});
		}
	});
});
