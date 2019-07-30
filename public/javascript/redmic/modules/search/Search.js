define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "./_SearchItfc"
], function(
	declare
	, lang
	, _Module
	, _Show
	, _SearchItfc
){
	return declare([_Module, _Show, _SearchItfc], {
		//	summary:
		//
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					SEARCH: "search",
					ADD_TO_QUERY: "addToQuery"
				},
				// own actions
				actions: {
					ADD_TO_QUERY: "addToQuery",
					SET_DEFAULT: "setDefault",
					REFRESH: "refresh",
					RESET: "reset",
					RESTORE: "restore"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			},{
				channel: this.getChannel("RESTORE"),
				callback: "_subRestore"
			},{
				channel: this.getChannel("SET_DEFAULT"),
				callback: "_subSetDefault"
			},{
				channel: this.getChannel("REFRESH"),
				callback: "_subRefresh"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_TO_QUERY',
				channel: this._buildChannel(this.queryChannel, this.actions.ADD_TO_QUERY)
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('SEARCH', lang.hitch(this, this._search));
		},

		_subReset: function() {

			this._reset();
		},

		_subRestore: function() {

			this._restore();
		},

		_search: function(/*Object*/ search) {

			if (this.search) {
				return this.search(search);
			}

			var obj = {
				query: search
			};

			if (search.omitRefresh !== undefined) {
				obj.omitRefresh = search.omitRefresh;
				delete search.omitRefresh;
			}

			this._emitEvt('ADD_TO_QUERY', obj);
		},

		_subSetDefault: function(data) {

			this._setDefault(data);
		},

		_subRefresh: function() {

			this._refresh();
		},

		_newSearch: function(/*object*/ evt) {

			if (this.newSearch) {
				return this.newSearch(evt);
			}

			var obj = {};

			obj[this.propertyName] = lang.clone(evt);

			this._emitEvt('SEARCH', obj);
		},

		_shouldOmitLoadingEvents: function() {

			return true;
		}
	});
});
