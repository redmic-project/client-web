define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión para agregar escuchas a los nodos del mapa de leaflet.
		//	description:
		//		Escucha las mutaciones de los contenedores y emite los eventos correspondientes.

		constructor: function(args) {

			this.config = {
				overlayContainerName: 'overlayPane'
			};

			lang.mixin(this, this.config, args);
		},

		_addContainerListeners: function() {

			this._addOverlayContainerListener();
		},

		_addOverlayContainerListener: function() {

			var overlayContainer = this.map.getPane(this.overlayContainerName);

			if (!overlayContainer) {
				return;
			}

			var mutationObserver = new MutationObserver(lang.hitch(this, this._onOverlayPaneMutation));

			mutationObserver.observe(overlayContainer, { childList: true });
		},

		_onOverlayPaneMutation: function(mutations, observer) {

			mutations.forEach(lang.hitch(this, this._onEachPaneMutation));
		},

		_onEachPaneMutation: function(mutation, i, arr) {

			if (mutation.type === "childList") {
				this._onChildListPaneMutation(mutation);
			}
		},

		_onChildListPaneMutation: function(mutation) {

			var i;

			for (i = 0; i < mutation.addedNodes.length; i++) {
				var addedNode = mutation.addedNodes[i];
				this._emitEvt('LAYER_ADDED_TO_PANE', { node: addedNode });
			}

			for (i = 0; i < mutation.removedNodes.length; i++) {
				var removedNode = mutation.removedNodes[i];
				this._emitEvt('LAYER_REMOVED_FROM_PANE', { node: removedNode });
			}
		}
	});
});
