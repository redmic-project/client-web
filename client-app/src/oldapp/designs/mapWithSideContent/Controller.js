define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/map/LeafletImpl"
	, "src/component/map/_PlaceNamesButton"
], function (
	_Controller
	, declare
	, lang
	, LeafletImpl
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

			var exts = [LeafletImpl, _PlaceNamesButton].concat(this.mapExts);

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
		}
	});
});
