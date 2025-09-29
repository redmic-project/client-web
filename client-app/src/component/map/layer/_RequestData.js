define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
) {

	return declare(null, {
		// summary:
		//   Extensión para realizar consultas de datos desde una capa.

		postCreate: function() {

			this.inherited(arguments);

			this._redraw();
		},

		_redraw: function(queryObj) {

			// TODO realmente se quiere evitar límites? puede causar fallos en el lado del servicio
			// preferible mostrar aviso si se llega al límite
			const query = queryObj ?? {size: null, qFlags: [1]};

			this._emitEvt('ADD_REQUEST_PARAMS', {
				target: this.target,
				params: {
					query
				}
			});

			if (this._shouldAbortRequest()) {
				this._emitEvt('LAYER_LOADED');
				return;
			}

			clearTimeout(this.timeoutRedrawHandler);
			this.timeoutRedrawHandler = setTimeout(lang.hitch(this, this._redrawRequestData), 100);
		},

		_redrawRequestData: function() {

			this._emitEvt('LAYER_LOADING');

			const path = this.targetPathParams ?? {};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target,
				action: '_search',
				params: {path},
				requesterId: this.getOwnChannel()
			});
		},

		_shouldAbortRequest: function() {

			var originalReturn = this.inherited(arguments);

			return originalReturn || !this.target || !!this.externalShouldAbortRequest?.();
		},

		_onTargetPropSet: function() {

			this.inherited(arguments);

			this._redraw();
		}
	});
});
