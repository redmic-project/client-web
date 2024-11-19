define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_Filter"
], function(
	declare
	, lang
	, aspect
	, _Filter
){
	return declare(_Filter, {
		//	summary:
		//		Extensión para añidir filtro a las capas.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				addFilterActions: {
					REFRESH: "refresh"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixAddFilterEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineAddFilterSubscriptions));
		},

		_mixAddFilterEventsAndActions: function () {

			lang.mixin(this.actions, this.addFilterActions);

			delete this.addFilterActions;
		},

		_defineAddFilterSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("REFRESH"),
				callback: "_subRefresh"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._removeSizeQueryParameter();
		},

		_subRefresh: function(query) {

			this._redraw(query);
		},

		_redraw: function(query) {

			if (query) {
				this._emitEvt('ADD_TO_QUERY', {
					query: query,
					omitRefresh: true
				});
			}

			if (!this._shouldAbortRequest()) {
				clearTimeout(this.timeoutRedrawHandler);
				this.timeoutRedrawHandler = setTimeout(lang.hitch(this, this._redrawRefresh), 100);
			} else {
				this.clear();
			}
		},

		_redrawRefresh: function() {

			this._emitEvt('LAYER_LOADING');

			this._emitEvt('REFRESH', {
				requesterId: this.getOwnChannel()
			});
		},

		_shouldAbortRequest: function() {

			if (!this.target) {
				return true;
			}

			if (this.externalShouldAbortRequest && this.externalShouldAbortRequest()) {
				return true;
			}

			return false;
		},

		_changeTarget: function(obj) {

			this.inherited(arguments);

			this._emitEvt('UPDATE_TARGET', obj);

			this._removeSizeQueryParameter();
			this._redraw();
		},

		_removeSizeQueryParameter: function() {

			// TODO realmente se quiere evitar límites? puede causar fallos en el lado del servicio
			// preferible mostrar aviso si se llega al límite
			this._emitEvt('ADD_TO_QUERY', {
				query: {
					size: null
				},
				omitRefresh: true
			});
		}
	});
});
