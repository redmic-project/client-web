define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
	, "redmic/modules/map/_PlaceNamesButton"
], function (
	_Controller
	, declare
	, lang
	, aspect
	, LeafletImpl
	, Map
	, _PlaceNamesButton
){
	return declare(_Controller, {
		//	summary:
		//		Controlador para diseño de vistas que contienen un mapa y un contenido a la derecha.

		constructor: function(args) {

			this.config = {
				controllerEvents: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer"
				},
				mapExts: []
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.mapConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.mapConfig || {}]);
		},

		_initializeController: function() {

			var exts = [LeafletImpl, Map, _PlaceNamesButton].concat(this.mapExts);

			this.map = new declare(exts)(this.mapConfig);
		},

		_defineControllerPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.map.getChannel("ADD_LAYER")
			},{
				event: 'REMOVE_LAYER',
				channel: this.map.getChannel("REMOVE_LAYER")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.map.getChannel("SHOW"), {
				node: this.mapNode
			});
		},

		_getNodeToShowLoading: function() {

			return this.mapNode;
		}
	});
});
