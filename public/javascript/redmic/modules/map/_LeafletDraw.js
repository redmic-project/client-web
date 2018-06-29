define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Extensión para la implementación de leaflet.
		//	description:
		//		Proporciona la fachada para trabajar con leaflet-draw.

		//	config: Object
		//		Opciones y asignaciones por defecto.

		constructor: function(args) {

			this.config = {
				drawOption: {},
				leafletDrawActions: {
					DRAG_IN_MAP: "dragInMap",
					DRAW_IN_MAP: "drawInMap",
					REMOVE_IN_MAP: "removeInMap"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixLeafletDrawEventsAndActions));
		},

		_mixLeafletDrawEventsAndActions: function () {

			lang.mixin(this.actions, this.leafletDrawActions);
			delete this.leafletDrawActions;
		},

		_subAddLayer: function(obj) {

			this.inherited(arguments);

			this._addDrawControl(obj);
		},

		_subRemoveLayer: function(obj) {

			this.inherited(arguments);

			this._removeDrawControl(obj);
		},

		_removeDrawControl: function(obj) {

			if (this._layerEdition && obj.layer && this._layerEdition.layer._leaflet_id === obj.layer._leaflet_id) {
				this._layerEdition = null;
				this.map.removeControl(this.drawControl);
			}
		},

		_addDrawControl: function(obj) {

			if (obj.drawOption) {
				this._layerEdition = obj;
				this.drawControl = new L.Control.Draw(obj.drawOption);
				this.drawControl.addTo(this.map);

				this._addEventDraw();
			}
		},

		_addEventDraw: function() {

			this.map.on(L.Draw.Event.CREATED, lang.hitch(this, function (e) {

				var type = e.layerType,
					layer = e.layer;

				this._publish(this._buildChannel(this._layerEdition.channel, this.actions.DRAW_IN_MAP), {
					layer: layer,
					type: type
				});
			}));

			this.map.on(L.Draw.Event.EDITED, lang.hitch(this, function (e) {

				var layers = e.layers._layers;

				for (var key in layers)
					this._publish(this._buildChannel(this._layerEdition.channel, this.actions.DRAG_IN_MAP), {
						layer: layers[key]
					});
			}));

			this.map.on(L.Draw.Event.DELETED, lang.hitch(this, function (e) {

				var layers = e.layers._layers;

				for (var key in layers)
					this._publish(this._buildChannel(this._layerEdition.channel, this.actions.REMOVE_IN_MAP), {
						layer: layers
					});
			}));
		}
	});
});