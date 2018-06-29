define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
], function(
	declare
	, lang
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Todo lo necesario para almacenar y hacer persistente las querys
		//	description:
		//		Proporciona métodos para almacenar las querys realizadas, indexadas
		//		por servicios
		//		TODO: hacer persistente en el servidor las querys realizadas

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					REQUEST_QUERY: "requestQuery"
				},
				// own actions
				actions: {
					REQUEST_QUERY: "requestQuery",
					AVAILABLE_QUERY: "availableQuery"
				},
				query: {},
				// mediator params
				ownChannel: "queryStore"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			var options = {
				predicate: lang.hitch(this, this._chkRequestHasTarget)
			};

			this.subscriptionsConfig.push({
				channel : this.getChannel("REQUEST_QUERY"),
				callback: "_subRequestQuery",
				options: options
			},{
				channel : this._buildChannel(this.storeChannel, this.actions.AVAILABLE_QUERY),
				callback: "_subAvailableQuery",
				options: options
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'REQUEST_QUERY',
				channel: this.getChannel("AVAILABLE_QUERY"),
				callback: "_pubAvailableQuery"
			});
		},

		_chkRequestHasTarget: function(request) {

			if (!request || !request.target) {
				return false;
			}

			return true;
		},

		_subAvailableQuery: function(request) {

			this.query[request.target] = request.query;

		},

		_subRequestQuery: function(request) {

			if (request.target) {
				this._emitEvt('REQUEST_QUERY', {
					success: true,
					query: this.query[request.target],
					target: request.target
				});
			} else {
				console.log("No target found");
			}
		},

		_pubAvailableQuery: function(channel, data) {

			this._publish(channel, data);
		}
	});
});
