define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/model/ModelImpl"
	, "redmic/modules/base/_Store"
], function(
	declare
	, lang
	, _Module
	, ModelImpl
	, _Store
){
	return declare([_Module, _Store], {
		//	summary:
		//		Implementación de gateway para juntar componentes de consultas y combinarlas en
		//		una petición conjunta.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				ownChannel: "filter",
				events: {
					ADD_TO_QUERY: "addToQuery",
					AVAILABLE_FACETS: "availableFacets",
					REFRESHED: "refresh",
					RESETTED: "resetted",
					SERIALIZED: "serialized",
					CHANGED_MODEL: "changedModel"
				},
				actions: {
					REFRESH: "refresh",
					ADD_TO_QUERY: "addToQuery",
					ADDED_TO_QUERY: "addedToQuery",
					REFRESHED: "refreshed",
					AVAILABLE_FACETS: "availableFacets",
					RESET: "reset",
					RESETTED: "resetted",
					REQUEST_FILTER: "requestFilter",
					CHANGED_MODEL: "changedModel",
					DESERIALIZE: "deserialize",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized",
					REQUESTED: "requested",
					MODEL_BUILD: "modelBuild",
					SET_PROPERTY_VALUE: "setPropertyValue",
					IS_VALID: "isValid",
					WAS_VALID: "wasValid"
				},
				_pendingAddToQuery: null,
				target: null,
				refreshToInit: false,
				serializeOnQueryUpdate: true
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function () {

			this.modelConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this._getTarget(),
				noSerializeNullValue: true,
				filterSchema: true,
				props: {
					serializeAdditionalProperties: true
				}
			}, this.modelConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			},{
				channel: this.getChannel("ADD_TO_QUERY"),
				callback: "_subAddToQuery"
			},{
				channel: this.getChannel("REFRESH"),
				callback: "_subRefresh"
			},{
				channel: this.getChannel("REQUEST_FILTER"),
				callback: "_subRequestFilter"
			},{
				channel: this.getChannel("SERIALIZE"),
				callback: "_subSerialize"
			},{
				channel: this.getChannel("DESERIALIZE"),
				callback: "_subDeserialize"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'REFRESHED',
				channel: this.getChannel("REFRESHED")
			},{
				event: 'AVAILABLE_FACETS',
				channel: this.getChannel("AVAILABLE_FACETS")
			},{
				event: 'RESETTED',
				channel: this.getChannel("RESETTED")
			},{
				event: 'CHANGED_MODEL',
				channel: this.getChannel("CHANGED_MODEL")
			},{
				event: 'SERIALIZED',
				channel: this.getChannel("SERIALIZED")
			},{
				event: 'REQUEST',
				channel: this.getChannel("REQUESTED")
			});
		},

		_initialize: function() {

			this._createModel();
		},

		_createModel: function(byInstance) {

			this._modelBuild = false;

			var isCorrect = !!this.modelChannel;

			if (!this.modelChannel) {
				isCorrect = this._createModelInstance();
			} else {
				this._modelBuild = true;
			}

			if (!isCorrect) {
				return;
			}

			this._createModelSubscriptions();
			this._createModelPublications();

			this._emitEvt("CHANGED_MODEL", {
				modelChannel: this.modelChannel
			});

			if (this.refreshToInit) {
				this._refresh();
			}
		},

		_createModelInstance: function() {

			if (!this._getTarget()) {
				//console.error("Nor target specified for model at form module '%s'", this.getChannel());
				return false;
			}

			if (this.modelInstance) {
				this._deleteModelSubscriptionAndPublications();
				this._publish(this.modelInstance.getChannel("DISCONNECT"));
				delete this.modelInstance;
			}

			this.modelInstance = new ModelImpl(this.modelConfig);

			this.modelChannel = this.modelInstance.getChannel();

			if (this.initQuery) {
				this._addToQuery(this.initQuery, false);
			}

			return true;
		},

		_createModelSubscriptions: function() {

			this._modelSubscriptions = this._setSubscriptions([{
				channel: this._getActionModelChannel("MODEL_BUILD"),
				callback: "_subModelBuild"
			}]);
		},

		_createModelPublications: function() {

			this._modelPublications = this._setPublications([{
				event: 'ADD_TO_QUERY',
				channel: this._getActionModelChannel("SET_PROPERTY_VALUE")
			}]);
		},

		_deleteModelSubscriptionAndPublications: function() {

			this._modelSubscriptions && this._removeSubscriptions(this._modelSubscriptions);
			this._modelPublications && this._removePublications(this._modelPublications);
		},

		_subModelBuild: function(req) {

			this._modelBuild = true;

			if (this._pendingAddToQuery) {
				this._addToQuery(this._pendingAddToQuery, this._serializePending);
				this._serializePending = false;
				this._pendingAddToQuery = null;
			}
		},

		_subAddToQuery: function(req) {

			var query = req.query,
				omitRefresh = req.omitRefresh;

			if (query.target) {
				delete query.target;
			}

			if (req.requesterId) {
				this.requesterId = req.requesterId;
			}

			if (query.size === undefined) {
				// TODO si anteriormente se pidió con un size determinado, queda persistente (y no debería, creo).
				// si se setea de nuevo cuando no venga definido, se consigue eliminar esa persistencia, además
				// de usar un límite superior para las consultas de datos.
				query.size = 50;
			}

			this._addToQuery(query, !omitRefresh);
		},

		_addToQuery: function(query, serialize) {

			if (this._modelBuild) {
				this._emitEvt('ADD_TO_QUERY', query);

				serialize && this._isValid({
					callback: this._subSerialized
				});

				this._publish(this.getChannel('ADDED_TO_QUERY'), query);
			} else {
				if (!this._pendingAddToQuery) {
					this._pendingAddToQuery = {};
				}

				this._pendingAddToQuery = this._merge([query, this._pendingAddToQuery]);
				this._serializePending = this._serializePending || serialize;
			}
		},

		_subDeserialize: function(req) {

			this._publish(this._getActionModelChannel("DESERIALIZE"), req);
		},

		_isValid: function(obj) {

			if (!this.modelChannel) {
				return;
			}

			this._once(this._getActionModelChannel("WAS_VALID"), lang.hitch(this, this._subWasValid, obj));

			this._publish(this._getActionModelChannel("IS_VALID"));
		},

		_getActionModelChannel: function(action) {

			return this._buildChannel(this.modelChannel, this.actions[action]);
		},

		_subWasValid: function(obj, res) {

			if (res.isValid) {
				this._serialize(obj);
			}
		},

		_subSerialize: function(req) {

			this._isValid({
				callback: this._serializedAndEmitEvt,
				configSerialize: req
			});
		},

		_serialize: function(obj) {

			if (!this.modelChannel) {
				return;
			}

			var callback = obj.callback,
				configSerialize = obj.configSerialize;

			this._once(this._getActionModelChannel("SERIALIZED"), lang.hitch(this, callback));

			this._publish(this._getActionModelChannel("SERIALIZE"), configSerialize || {});
		},

		_serializedAndEmitEvt: function(req) {

			this._emitEvt('SERIALIZED', req);
		},

		_subSerialized: function(req) {

			this._request(req);
		},

		_subRequestFilter: function(req) {

			this._request(req);
		},

		_request: function(req) {

			this._lastRequest = this._getRequestObj(req.data);

			this.serializeOnQueryUpdate && this._emitEvt('REQUEST', this._lastRequest);
		},

		_subRefresh: function(req) {

			this._refresh(req);
		},

		_refresh: function(obj) {

			if (obj && obj.requesterId) {
				this.requesterId = obj.requesterId;
			}

			if (this._pendingAddToQuery) {
				this._serializePending = true;
			} else {
				this._isValid({
					callback: this._subSerialized
				});
			}

			this._once(this.getChannel("AVAILABLE"), lang.hitch(this, this._emitEvt, 'REFRESHED'));
		},

		_updateTarget: function(res) {

			if (!this._getTarget()) {
				return;
			}

			this.modelConfig.target = this._getTarget();

			delete this.modelChannel;

			this._createModel();

			if (res.refresh) {
				this._refresh();
			}
		},

		_getRequestObj: function(query) {

			var obj = {
				method: "POST",
				query: query,
				target: this._getTarget(),
				action: '_search'
			};

			if (this.requesterId) {
				obj.requesterId = this.requesterId;
			}

			return obj;
		},

		_dataAvailable: function(res) {

			if (res && res.data) {
				if (res.data.aggregations) {
					this._emitEvt('AVAILABLE_FACETS', res.data.aggregations); // TODO: Eliminar cuando se devuelva siempre _aggs
				} else if (res.data._aggs) {
					this._emitEvt('AVAILABLE_FACETS', res.data._aggs);
				}
			}
		},

		_subReset: function() {

			this._createModel();

			this._emitEvt('RESETTED', {
				modelChannel: this.modelChannel
			});
		}
	});
});
