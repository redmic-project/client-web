define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Selection"
], function(
	declare
	, lang
	, _Module
	, _Selection
){
	return declare([_Module, _Selection], {
		//	summary:
		//		Todo lo necesario para trabajar con layers tree.
		//	description:
		//		Proporciona métodos crear un árbol de layers para trabajar con el mapa.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {

				// own events
				events: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer"
				},
				// own actions
				actions: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer"
				},
				// mediator params
				ownChannel: "layersTree",

				mapChannel: null,
				treeChannel: null
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.treeChannel, this.actions.SELECT),
				callback: "_subSelected"
			},{
				channel: this._buildChannel(this.treeChannel, this.actions.DESELECT),
				callback: "_subDeselected"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this._buildChannel(this.mapChannel, this.actions.ADD_LAYER),
				callback: "_pubLayerAddedOrRemoved"
			},{
				event: 'REMOVE_LAYER',
				channel: this._buildChannel(this.mapChannel, this.actions.REMOVE_LAYER),
				callback: "_pubLayerAddedOrRemoved"
			});
		},

		_select: function(/*Object*/ item) {

			item && item.layer && this._emitEvt('ADD_LAYER', item.layer);
		},

		_deselect: function(/*Object*/ item) {

			item && item.layer && this._emitEvt('REMOVE_LAYER', item.layer);
		},

		_pubLayerAddedOrRemoved: function(/*String*/ channel, /*Object*/ evt) {

			this._publish(channel, {
				layer: evt
			});
		}

	});
});
