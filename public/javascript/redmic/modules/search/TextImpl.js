define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_Store"
	, "RWidgets/TextSearch"
	, "./Search"
], function(
	declare
	, lang
	, aspect
	, put
	, _Store
	, TextSearch
	, Search
){
	return declare([Search, _Store], {
		//	summary:
		//		Todo lo necesario para trabajar con TextSearch.
		//	description:
		//		Proporciona métodos y contenedor para la búsqueda de tipo texto.

		constructor: function(args) {

			this.config = {
				textEvents: {
					CLOSE: "close",
					CLOSED: "closed",
					SERIALIZED: "serialized",
					CHANGE_SEARCH_PARAMS: "changeSearchParams"
				},
				// own actions
				textActions: {
					CLOSE: "close",
					CLOSED: "closed",
					SEARCH_PARAMS_CHANGED: "searchParamsChanged",
					UPDATE_TEXT_SEARCH_PARAMS: "updateTextSearchParams",
					REQUESTED: "requested",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized"
				},
				methodSuggest: "POST",
				action: "_suggest",
				itemLabel: null,
				textValue: '',
				ownChannel: "textSearch"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixTextEventsAndActions));
			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setTextConfigurations));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineTextPublications));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineTextSubscriptions));
		},

		_mixTextEventsAndActions: function () {

			lang.mixin(this.events, this.textEvents);
			lang.mixin(this.actions, this.textActions);

			delete this.textEvents;
			delete this.textActions;
		},

		_setTextConfigurations: function() {

			this.textSearchConfig = this._merge([{
				itemLabel: this.itemLabel,
				i18n: this.i18n
			}, this.textSearchConfig || {}]);
		},

		_defineTextSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("CLOSE"),
				callback: "_subClose"
			},{
				channel: this.getChannel("UPDATE_TEXT_SEARCH_PARAMS"),
				callback: "_subUpdateTextSeachParams"
			},{
				channel: this._buildChannel(this.queryChannel, this.actions.REQUESTED),
				callback: "_subRequested"
			});
		},

		_defineTextPublications: function() {

			this.publicationsConfig.push({
				event: 'CLOSED',
				channel: this.getChannel("CLOSED"),
				callback: "_pubClosed"
			},{
				event: 'CHANGE_SEARCH_PARAMS',
				channel: this.getChannel("SEARCH_PARAMS_CHANGED")
			});
		},

		_initialize: function() {

			this.textSearch = new TextSearch(this.textSearchConfig);

			this.textSearch.on("newSearch", lang.hitch(this, this._newSearch));

			this.textSearch.on("closed", lang.hitch(this, this._groupEventArgs, 'CLOSED'));

			this.textSearch.on("requestSuggests", lang.hitch(this, this._requestSuggestions));

			this.textSearch.on("changeSearchParams", lang.hitch(this, this._changeSearchParams));
		},

		_getNodeToShow: function() {

			return this.textSearch.domNode;
		},

		_requestSuggestions: function(/*Object*/ evt) {

			this._emitEvt('SEARCH', {
				suggest: this._createSuggest(evt),
				query: this.initialQuery,
				omitRefresh: true
			});

			this._once(this._buildChannel(this.queryChannel, this.actions.SERIALIZED),
				lang.hitch(this, this._subSerialized, evt));

			this._publish(this._buildChannel(this.queryChannel, this.actions.SERIALIZE));
		},

		_subSerialized: function(evt, req) {

			this._emitEvt('REQUEST', {
				target: this._getTarget(),
				action: this.action,
				requesterId: this.getOwnChannel(),
				method: this.methodSuggest,
				query: req.data
			});
		},

		_subRequested: function(req) {

			var query = req.query,
				text = (query.text && query.text.text) || '';

			this.textSearch.setValue(text);
		},

		_dataAvailable: function(/*Object*/ response) {

			if (response.requesterId === this.getOwnChannel()) {
				this._setSuggestions(response.data);
			}
		},

		_setSuggestions: function(/*Object*/ result) {

			this._emitEvt('SEARCH', {
				suggest: null,
				omitRefresh: true
			});

			this.textSearch.emit("receivedSuggests", result);
		},

		_setDefault: function(obj) {

			this.textSearch.emit('setDefault', obj.data);

			if (obj.execute) {
				this.textSearch.emit('execute');
			}
		},

		_newSearch: function(evt) {

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.search,
					action: TRACK.action.send,
					label: evt + " [" + this._getTarget() + "]"
				}
			});

			this._emitEvt('SEARCH', {
				text: this._createQuery(evt),
				from: 0
			});
		},

		_refresh: function() {

			this.textSearch.emit("refresh");
		},

		_createSuggest: function(query) {

			if (this.suggestFields) {
				query.searchFields = this.suggestFields;
			}

			return query;
		},

		_createQuery: function(value) {

			var query = {
				"text": value
			};

			if (this.searchFields) {
				query.searchFields = this.searchFields;
			}

			if (this.highlightField) {
				query.highlightFields = this.highlightField;
			}

			return value !== "" ? query : null;
		},

		_changeSearchParams: function(evt) {

			this._emitEvt('CHANGE_SEARCH_PARAMS', evt);
		},

		_subClose: function() {

			this._close();
		},

		_close: function() {

			this.textSearch.emit("close");
		},

		_reset: function() {

			this.textSearch.setI18n(this.i18n);
			this.textSearch.emit("reset");
		},

		_subUpdateTextSeachParams: function(evt) {

			var fields = evt.suggestFields;
			fields && this._updateTextSearchParams(fields);
		},

		_updateTextSearchParams: function(fields) {

			this.textSearch.set("suggestFields", fields);
		},

		_pubClosed: function(/*String*/ channel, /*Object*/ evt) {

			this._publish(channel, {success: true});
		}
	});
});
