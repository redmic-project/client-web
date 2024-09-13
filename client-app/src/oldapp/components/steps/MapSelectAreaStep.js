define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'leaflet/leaflet'
	, "put-selector/put"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "RWidgets/Button"
	, "RWidgets/Map"
], function (
	ContentPane
	, declare
	, lang
	, aspect
	, L
	, put
	, _Module
	, _Show
	, Button
	, Map
){
	return declare([_Module, _Show, ContentPane], {
		//	summary:
		//		Step de

		constructor: function (args) {

			this.config = {
				_results: {},
				idProperty: "id",
				_okResizeMap: false,
				'class': "flexibleCenteredContainer",
				widthAreaSelect: 256,
				heightAreaSelect: 256,
				zoom: 7,
				latCenter: 28.3,
				lonCenter: -16.5,
				_defaultData: {},

				ownChannel: "mapSelectAreaStep",

				actions: {
					DESERIALIZE: "deserialize"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.modelChannel, this.actions.DESERIALIZE),
				callback: "_subDeserialize"
			});
		},

		_initialize: function() {

			this.mapSearch = new Map({
				"class": "mapSearch mapSearchNotSelectArea",
				widthAreaSelect: this.widthAreaSelect,
				heightAreaSelect: this.heightAreaSelect,
				zoom: this.zoom,
				latCenter: this.latCenter,
				lonCenter: this.lonCenter
			});

			//	TODO cambiar a modulo
			this.mapSearch.on("resizeComplete", lang.hitch(this, this._resizeCompleteMap));
		},

		_resizeCompleteMap: function() {

			if (!this._okResizeMap) {
				this.mapSearch.on("queryMap", lang.hitch(this, this._newSearch));
			}

			this._okResizeMap = true;
		},

		postCreate: function() {

			this.inherited(arguments);

			this._showMap();

			this._createContainerImage();
		},

		getNodeToShow: function() {

			return this.containerNode;
		},

		_subDeserialize: function(res) {

			this._instanceDataToResult(res.data);
		},

		_instanceDataToResult: function(data) {

			this._changeData(data);

			this._defaultData = data;

			var image = data.image;

			if (image) {
 				this._setImageAndShowContainerImage(image);
			} else {
				this._showMap();
			}
		},

		_setImageAndShowContainerImage: function(image) {

			this._hideMap();

			put(this.containerNode, this.containerImage);
			put(this.contentImage, '[src="' + image + '"]');
		},

		_hideContainerImage: function() {

			put(this.containerImage, '!');
		},

		_showMap: function() {

			this.mapSearch.emit("center");

			this.mapSearch.placeAt(this.containerNode);
			this.mapSearch.resize();
		},

		_hideMap: function() {

			put(this.mapSearch.domNode, "!");
		},

		_createContainerImage: function() {

			this.containerImage = put('div.containerImageLayerEdit');
			this.contentImage = put(this.containerImage, 'img');

			this.contentImage.onclick = lang.hitch(this, this._onClickChangeImage);

			this.chageImageButton = new Button({
				'class': "primary",
				title: this.i18n.changeImage,
				label: this.i18n.changeImage,
				onClick: lang.hitch(this, this._onClickChangeImage)
			}).placeAt(this.containerImage);
		},

		_onClickChangeImage: function() {

			this._hideContainerImage();

			this._showMap();
		},

		_changeData: function(data) {

			if (this._defaultData && this._defaultData[this.idProperty] === data[this.idProperty])
				return;

			this.mapSearch.emit("reset");

			var format = null;

			if (data.formats && data.formats.length > 0) {
				for (var i = 0; i < data.formats.length; i++) {
					if (data.formats[i] == "image/png") {
						format = data.formats[i];
						break;
					}
				}

				if (!format) {
					format = data.formats[0];
				}
			}

			var obj = {
				urlMap: data.urlSource,
				layers: data.name,
				format: format,
				transparent: true
			};

			this.mapSearch.emit("addLayer", obj);
		},

		_newSearch: function(/*object*/ evt) {

			this._results = {
				'maxX':  evt._northEast.lng,
				'maxY':  evt._northEast.lat,
				'minX':  evt._southWest.lng,
				'minY':  evt._southWest.lat
			};

			this._emitChangeResults();

			this._isCompleted = true;

			this._emitEvt('REFRESH_STATUS');
		},

		_emitChangeResults: function() {

			if (this.propertyName) {
				var obj = {};
				obj[this.propertyName] = this._results;

				this._emitEvt('SET_PROPERTY_VALUE', obj);
			}
		},

		_clearStep: function() {

			this._results = {};
			this._isCompleted = false;

			this._hideContainerImage();
			this._showMap();
		},

		_resetStep: function() {

			this._instanceDataToResult(this._defaultData);
		}
	});
});
