define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		// summary:
		//   Extensión para realizar consultas de datos desde una capa.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				_requestDataTimeoutMs: 100
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addDefaultRequestParams();
			this._redraw();
		},

		_addDefaultRequestParams: function() {

			const path = this._merge([{
			}, this.targetPathParams ?? {}]);

			const query = this._merge([{
				// TODO realmente se quiere evitar límites? puede causar fallos en el lado del servicio
				// preferible mostrar aviso si se llega al límite
				size: null
			}, this.targetQueryParams ?? {}]);

			this._emitEvt('ADD_REQUEST_PARAMS', {
				target: this.target,
				params: {path, query}
			});
		},

		_redraw: function() {

			this.inherited(arguments);

			if (this._shouldAbortRequest()) {
				this._emitEvt('LAYER_LOADED');
				return;
			}

			clearTimeout(this.timeoutRedrawHandler);
			this.timeoutRedrawHandler = setTimeout(() => this._redrawRequestData(), this._requestDataTimeoutMs);
		},

		_redrawRequestData: function() {

			this._emitEvt('LAYER_LOADING');

			const path = this.targetPathParams ?? {},
				query = this.targetQueryParams ?? {};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target,
				params: {path, query},
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
		},

		_onTargetPathParamsPropSet: function(res) {

			this.inherited(arguments);

			this._redraw();
		},

		_onTargetQueryParamsPropSet: function(res) {

			this.inherited(arguments);

			this._redraw();
		}
	});
});
