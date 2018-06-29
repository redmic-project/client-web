define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/filter/Filter"
	, "./_FilterItfc"
], function (
	declare
	, lang
	, aspect
	, Filter
	, _FilterItfc
){
	return declare(_FilterItfc, {
		//	summary:
		//

		constructor: function() {

			this.config = {
				filterEvents: {
					ADD_TO_QUERY: "addToQuery",
					REFRESH: "refresh",
					UPDATE_TARGET: "updateTarget"
				},
				filterActions: {}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixFilterEventsAndActions));
			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setFilterConfigurations));
			aspect.before(this, "_beforeInitialize", lang.hitch(this, this._initializeFilter));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineFilterSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineDefaultFilterPublications));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineFilterPublications));
		},

		_mixFilterEventsAndActions: function () {

			lang.mixin(this.events, this.filterEvents);
			lang.mixin(this.actions, this.filterActions);

			delete this.filterEvents;
			delete this.filterActions;
		},

		_setFilterConfigurations: function() {

			this.filterConfig = this._merge([{
				target: this.target,
				parentChannel: this.getChannel()
			}, this.filterConfig || {}]);
		},

		_defineDefaultFilterPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_TO_QUERY',
				channel: this.filter.getChannel("ADD_TO_QUERY")
			},{
				event: 'REFRESH',
				channel: this.filter.getChannel("REFRESH")
			},{
				event: 'UPDATE_TARGET',
				channel: this.filter.getChannel("UPDATE_TARGET")
			});
		},

		_initializeFilter: function() {

			this.filter = new Filter(this.filterConfig);
			this.queryChannel = this.filter.getChannel();

			this._setQueryChannelInModules();
		},

		_subUpdateTarget: function(obj) {

			this.inherited(arguments);

			this._emitEvt('UPDATE_TARGET', obj);
		},

		_updateTarget: function(obj) {

			this.inherited(arguments);

			this._emitEvt('UPDATE_TARGET', obj);
		}
	});
});