define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, './_ListenQueryParamsItfc'
], function(
	declare
	, lang
	, aspect
	, _ListenQueryParamsItfc
) {

	return declare(_ListenQueryParamsItfc, {
		//	summary:
		//		Permite a los módulos escuchar los parámetros de URL recibidos por la app.

		listenQueryParamsEvents: {
			GET_QUERY_PARAMS: 'getQueryParams'
		},

		listenQueryParamsActions: {
			GET_QUERY_PARAMS: 'getQueryParams',
			GOT_QUERY_PARAMS: 'gotQueryParams'
		},


		constructor: function(args) {

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixListenQueryParamsEventsAndActions));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineListenQueryParamsSubscriptions));
			aspect.after(this, '_definePublications', lang.hitch(this, this._defineListenQueryParamsPublications));
		},

		_mixListenQueryParamsEventsAndActions: function() {

			lang.mixin(this.events, this.listenQueryParamsEvents);
			lang.mixin(this.actions, this.listenQueryParamsActions);
			delete this.listenQueryParamsEvents;
			delete this.listenQueryParamsActions;
		},

		_defineListenQueryParamsSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.rootChannel, this.actions.GOT_QUERY_PARAMS),
				callback: '_subGotQueryParams'
			});
		},

		_defineListenQueryParamsPublications: function() {

			this.publicationsConfig.push({
				event: 'GET_QUERY_PARAMS',
				channel: this._buildChannel(this.rootChannel, this.actions.GET_QUERY_PARAMS)
			});
		},

		_subGotQueryParams: function(res) {

			this._gotQueryParams(res);

			for (var param in res) {
				this._gotQueryParam(param, res[param]);
			}
		}
	});
});
