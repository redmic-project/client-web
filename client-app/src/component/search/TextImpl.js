define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'dojo/query'
	, "src/component/base/_Store"
	, "RWidgets/TextSearch"
	, "./Search"
], function(
	declare
	, lang
	, aspect
	, query
	, _Store
	, TextSearch
	, Search
) {

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
					CHANGE_SEARCH_PARAMS: "changeSearchParams",
					EXPAND_SEARCH: 'expandSearch'
				},
				textActions: {
					CLOSE: "close",
					CLOSED: "closed",
					SEARCH_PARAMS_CHANGED: "searchParamsChanged",
					UPDATE_TEXT_SEARCH_PARAMS: "updateTextSearchParams",
					REQUESTED: "requested",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized",
					EXPAND_SEARCH: 'expandSearch'
				},
				methodSuggest: "POST",
				suggestAction: "_suggest",
				searchAction: "_search",
				itemLabel: null,
				textValue: '',
				ownChannel: "textSearch",
				legacyMode: true,
				suggestionsContainerClass: 'suggestions'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixTextEventsAndActions));
			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setTextConfigurations));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineTextPublications));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineTextSubscriptions));
		},

		_mixTextEventsAndActions: function() {

			lang.mixin(this.events, this.textEvents);
			lang.mixin(this.actions, this.textActions);

			delete this.textEvents;
			delete this.textActions;
		},

		_setTextConfigurations: function() {

			this.textSearchConfig = this._merge([{
				itemLabel: this.itemLabel,
				i18n: this.i18n,
				suggestionsContainerClass: this.suggestionsContainerClass,
				showExpandIcon: this.showExpandIcon
			}, this.textSearchConfig || {}]);
		},

		_defineTextSubscriptions: function() {

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
			},{
				event: 'EXPAND_SEARCH',
				channel: this.getChannel('EXPAND_SEARCH')
			});
		},

		_initialize: function() {

			this.textSearch = new TextSearch(this.textSearchConfig);

			this.textSearch.on("newSearch", lang.hitch(this, this._newSearch));

			this.textSearch.on("closed", lang.hitch(this, this._groupEventArgs, 'CLOSED'));

			this.textSearch.on("requestSuggests", lang.hitch(this, this._requestSuggestions));

			this.textSearch.on("changeSearchParams", lang.hitch(this, this._changeSearchParams));

			this.textSearch.on('expandSearch', lang.hitch(this, this._groupEventArgs, 'EXPAND_SEARCH'));

			this._globalClicksHandler = this._listenGlobalClicks(lang.hitch(this, this._evaluateToCloseSuggests));
			this._globalClicksHandler.pause();
		},

		getNodeToShow: function() {

			return this.textSearch.domNode;
		},

		_evaluateToCloseSuggests: function(evt) {

			if (!this._suggestionsContainer) {
				var suggestionsContainer = query('div.' + this.suggestionsContainerClass, this.ownerDocumentBody);
				if (suggestionsContainer.length) {
					this._suggestionsContainer = suggestionsContainer[0];
				}
			}

			var nodeBelongsToSuggestionsContainer = this._checkClickBelongsToNode(evt, this._suggestionsContainer),
				nodeBelongsToTextSearch = this._checkClickBelongsToNode(evt, this.textSearch.domNode);

			if (!nodeBelongsToSuggestionsContainer && !nodeBelongsToTextSearch) {
				this._close();
			}
		},

		_requestSuggestions: function(/*Object*/ evt) {

			this._globalClicksHandler.resume();

			this._emitEvt('SEARCH', {
				suggest: this._createSuggest(evt),
				query: this.initialQuery,
				omitRefresh: true
			});

			this._once(this._buildChannel(this.queryChannel, this.actions.SERIALIZED),
				lang.hitch(this, this._subSerialized, evt, this.suggestAction));

			this._publish(this._buildChannel(this.queryChannel, this.actions.SERIALIZE));
		},

		_subRequested: function(req) {

			var queryObj = req.query,
				text = (queryObj.text && queryObj.text.text) || '';

			this.textSearch.setValue(text);
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.requesterId === this.getOwnChannel()) {
				this._setSuggestions(res.data);
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

			this._emitEvt('SEARCH', {
				text: this._createQuery(evt),
				from: 0,
				omitRefresh: true
			});

			//Por retrocompatibilidad se debe llamar a _subSerialized
			if (this.legacyMode) {
				this._once(this._buildChannel(this.queryChannel, this.actions.SERIALIZED),
					lang.hitch(this, this._subSerialized, evt, this.searchAction));
			}

			this._publish(this._buildChannel(this.queryChannel, this.actions.SERIALIZE));
		},

		_subSerialized: function(evt, action, req) {

			// TODO: con esto se consigue que las respuestas a peticiones de datos hechas en modo legacy
			// se escuchen fuera, para cargar los datos en catálogos, por ejemplo.
			// Lo ideal sería suprimir este modo (que TextImpl solo pida sugerencias) y resolver la petición
			// de datos cuando se escuche 'ADDED_TO_QUERY' del módulo Filter (por ejemplo, desde _Filter).
			var requesterId = action === '_suggest' ? this.getOwnChannel() : null;

			this._emitEvt('REQUEST', {
				target: this._getTarget(),
				action: action,
				requesterId: requesterId,
				method: this.methodSuggest,
				query: req.data
			});
		},

		_refresh: function() {

			this.textSearch.emit("refresh");
		},

		_createSuggest: function(queryObj) {

			if (this.suggestFields) {
				queryObj.searchFields = this.suggestFields;
			}

			return queryObj;
		},

		_createQuery: function(value) {

			var queryObj = {
				"text": value
			};

			if (this.searchFields) {
				queryObj.searchFields = this.searchFields;
			}

			if (this.highlightField) {
				queryObj.highlightFields = this.highlightField;
			}

			return value !== "" ? queryObj : null;
		},

		_changeSearchParams: function(evt) {

			this._emitEvt('CHANGE_SEARCH_PARAMS', evt);
		},

		_subClose: function() {

			this._close();
		},

		_close: function() {

			this.textSearch.emit("close");
			this._globalClicksHandler.pause();
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
