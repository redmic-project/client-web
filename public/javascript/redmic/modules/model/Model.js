define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, 'redmic/modules/base/_Persistence'
	, "redmic/modules/base/_Store"
	, "./_ModelItfc"
], function(
	declare
	, lang
	, _Module
	, _Persistence
	, _Store
	, _ModelItfc
) {

	return declare([_Module, _Store, _Persistence, _ModelItfc], {
		//	summary:
		//		Módulo para trabajar con instancias de modelos.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				events: {
					VALUE_CHANGED: "valueChanged",
					VALIDATION_ERRORS_CHANGED: "validationErrorsChanged",
					WAS_VALID: "wasValid",
					GOT_PROPERTY_INSTANCE: "gotPropertyInstance",
					SERIALIZED: "serialized",
					GOT_PROPERTY_VALUE: "gotPropertyValue",
					WAS_CHANGED: "wasChanged",
					GOT_ID_PROPERTY: "gotIdProperty",
					VALUE_ADDED: "valueAdded",
					VALUE_REMOVED: "valueRemoved",
					VALUE_REINDEXED: "valueReindexed",
					MODEL_BUILD: "modelBuild",
					GOT_MODEL_UUID: "gotModelUuid",
					SAVE_MODEL: 'saveModel',
					GOT_PROPERTY_SCHEMA: "gotPropertySchema"
				},
				actions: {
					SET_PROPERTY_VALUE: "setPropertyValue",
					GOT_PROPERTY_VALUE: "gotPropertyValue",
					GET_PROPERTY_VALUE: "getPropertyValue",
					VALUE_CHANGED: "valueChanged",
					VALIDATION_ERRORS_CHANGED: "validationErrorsChanged",
					IS_VALID: "isValid",
					WAS_VALID: "wasValid",
					GOT_PROPERTY_INSTANCE: "gotPropertyInstance",
					GET_PROPERTY_INSTANCE: "getPropertyInstance",
					DESERIALIZE: "deserialize",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized",
					RESET: "reset",
					CLEAR: "clear",
					HAS_CHANGED: "hasChanged",
					WAS_CHANGED: "wasChanged",
					DELETE_VALUE: "deleteValue",
					ADD_VALUE: "addValue",
					VALUE_ADDED: "valueAdded",
					VALUE_REMOVED: "valueRemoved",
					GET_ID_PROPERTY: "getIdProperty",
					GOT_ID_PROPERTY: "gotIdProperty",
					VALUE_REINDEXED: "valueReindexed",
					REMEMBER_CURRENT_VALUE: "rememberCurrentValue",
					MODEL_BUILD: "modelBuild",
					GET_MODEL_UUID: "getModelUuid",
					GOT_MODEL_UUID: "gotModelUuid",
					GOT_PROPERTY_SCHEMA: "gotPropertySchema",
					GET_PROPERTY_SCHEMA: "getPropertySchema"
				},
				idForGet: '_schema'
			};

			lang.mixin(this, this.config, args);

			if (this.filterSchema) {
				this.idForGet = '_search/_schema';
			}
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("ADD_VALUE"),
				callback: "_subAddValue"
			},{
				channel: this.getChannel("DELETE_VALUE"),
				callback: "_subDeleteValue"
			},{
				channel: this.getChannel("SET_PROPERTY_VALUE"),
				callback: "_subSetPropertyValue"
			},{
				channel: this.getChannel("GET_PROPERTY_VALUE"),
				callback: "_subGetPropertyValue"
			},{
				channel: this.getChannel("GET_PROPERTY_INSTANCE"),
				callback: "_subGetPropertyInstance"
			},{
				channel: this.getChannel("DESERIALIZE"),
				callback: "_subDeserialize"
			},{
				channel: this.getChannel("SERIALIZE"),
				callback: "_subSerialize"
			},{
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel: this.getChannel("IS_VALID"),
				callback: "_subIsValid"
			},{
				channel: this.getChannel("HAS_CHANGED"),
				callback: "_subHasChanged"
			},{
				channel: this.getChannel("GET_ID_PROPERTY"),
				callback: "_subGetIdProperty"
			},{
				channel: this.getChannel("REMEMBER_CURRENT_VALUE"),
				callback: "_subRememberCurrentValue"
			},{
				channel: this.getChannel("GET_MODEL_UUID"),
				callback: "_subGetModelUuid"
			},{
				channel: this.getChannel('SAVE'),
				callback: '_subSave'
			},{
				channel: this.getChannel("GET_PROPERTY_SCHEMA"),
				callback: "_subGetPropertySchema"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'VALUE_CHANGED',
				channel: this.getChannel("VALUE_CHANGED")
			},{
				event: 'VALIDATION_ERRORS_CHANGED',
				channel: this.getChannel("VALIDATION_ERRORS_CHANGED")
			},{
				event: 'WAS_VALID',
				channel: this.getChannel("WAS_VALID")
			},{
				event: 'GOT_PROPERTY_INSTANCE',
				channel: this.getChannel("GOT_PROPERTY_INSTANCE")
			},{
				event: 'GOT_PROPERTY_VALUE',
				channel: this.getChannel("GOT_PROPERTY_VALUE")
			},{
				event: 'SERIALIZED',
				channel: this.getChannel("SERIALIZED")
			},{
				event: 'WAS_CHANGED',
				channel: this.getChannel("WAS_CHANGED")
			},{
				event: 'GOT_ID_PROPERTY',
				channel: this.getChannel("GOT_ID_PROPERTY")
			},{
				event: 'VALUE_ADDED',
				channel: this.getChannel("VALUE_ADDED")
			},{
				event: 'VALUE_REMOVED',
				channel: this.getChannel("VALUE_REMOVED")
			},{
				event: 'VALUE_REINDEXED',
				channel: this.getChannel("VALUE_REINDEXED")
			},{
				event: 'MODEL_BUILD',
				channel: this.getChannel("MODEL_BUILD")
			},{
				event: 'GOT_MODEL_UUID',
				channel: this.getChannel("GOT_MODEL_UUID")
			},{
				event: 'SAVE_MODEL',
				channel: this.getChannel('SAVED')
			},{
				event: 'GOT_PROPERTY_SCHEMA',
				channel: this.getChannel("GOT_PROPERTY_SCHEMA")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this.schema) {
				this._buildModelWithSchema(this.schema);
			} else {
				this._emitEvt("GET", {
					target: this.target,
					id: this.idForGet,
					requesterId: this.getOwnChannel()
				});
			}
		},

		_itemAvailable: function(res, resWrapper) {

			if (resWrapper.requesterId !== this.getOwnChannel()) {
				return;
			}

			var schema = res.data;

			if (this.filterSchema) {
				schema = schema.schema;
			}

			this._buildModelWithSchema(schema);
		},

		_buildModelWithSchema: function(/*Object*/ schema) {

			this.modelInstance.build(schema).then(lang.hitch(this, this._onModelBuilt));
		},

		_subSetPropertyValue: function(req) {

			for (var key in req) {
				this._setPropertyValue(key, req[key]);
			}
		},

		_subDeleteValue: function(req) {

			for (var key in req) {
				this._deleteValue(key, req[key]);
			}
		},

		_subAddValue: function(req) {

			for (var key in req) {
				this._addValue(key, req[key]);
			}
		},

		_subGetPropertyValue: function(req) {

			this._getPropertyValue(req);
		},

		_subGetPropertyInstance: function(req) {

			this._getPropertyInstance(req);
		},

		_subDeserialize: function(req) {

			this._deserialize(req);
		},

		_subSerialize: function(req) {

			this._serialize(req);
		},

		_subReset: function(req) {

			this._reset(req);
		},

		_subClear: function(req) {

			this._clear(req);
		},

		_subIsValid: function(req) {

			if (req && req.propertyName) {
				this._getPropertyIsValidStatus(req);
			} else {
				this._getIsValidStatus();
			}
		},

		_subHasChanged: function() {

			this._getHasChangedStatus();
		},

		_subGetIdProperty: function(req) {

			this._getIdPropertyValue(req);
		},

		_subRememberCurrentValue: function(req) {

			this._rememberCurrentValue(req);
		},

		_subGetModelUuid: function(req) {

			this._emitEvt('GOT_MODEL_UUID', {
				uuid: this._getModelUuid(req)
			});
		},

		_subSave: function(req) {

			this._saveModel(req);
		},

		_subGetPropertySchema: function(req) {

			this._getPropertySchema(req);
		}
	});
});
