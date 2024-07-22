define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/model/ModelImpl"
	, "./_FormItfc"
], function(
	declare
	, lang
	, _Module
	, _Show
	, ModelImpl
	, _FormItfc
){
	return declare([_Module, _FormItfc, _Show], {
		//	summary:
		//		Muestra detalles de un item
		//	description:
		//		Proporciona métodos para mostrar los detalles de un item

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				showBtn: {},
				idProperty: "id",
				events: {
					CANCEL: "cancel",
					CANCELLED: "cancelled",
					ENABLE_BUTTONS: "enableButtons",
					DISABLE_BUTTONS: "disableButtons",
					SUBMITTED: "submitted",
					GET_IS_VALID_STATUS: "getIsValidStatus",
					GOT_IS_VALID_STATUS: "gotIsValidStatus",
					RESET: "reset",
					RESETTED: "resetted",
					CLEAR: "clear",
					CLEARED: "cleared",
					SET_PROPERTY_VALUE: "setPropertyValue",
					DESERIALIZE: "deserialize",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized",
					GOT_PROPERTY_VALUE: "gotPropertyValue"
				},
				actions: {
					SAVED: "saved",
					CANCEL: "cancel",
					CANCELLED: "cancelled",
					RESET: "reset",
					RESETTED: "resetted",
					CLEAR: "clear",
					CLEARED: "cleared",
					SET_METHOD: "setMethod",
					SET_PROPERTY_VALUE: "setPropertyValue",
					GET_PROPERTY_VALUE: "getPropertyValue",
					GOT_PROPERTY_VALUE: "gotPropertyValue",
					SET_DATA: "setData",
					GOT_IS_VALID_STATUS: "gotIsValidStatus",
					IS_VALID: "isValid",
					WAS_VALID: "wasValid",
					SUBMIT: "submit",
					SUBMITTED: "submitted",
					DESERIALIZE: "deserialize",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized",
					EMBED_ELEMENT: "embedElement",
					VALUE_CHANGED: "valueChanged",
					DEPENDENCE_VALUE_CHANGED: "dependenceValueChanged",
					ENABLE_PROPERTY: "enableProperty",
					DISABLE_PROPERTY: "disableProperty",
					ENABLE: "enable",
					DISABLE: "disable",
					VALIDATION_ERRORS_CHANGED: "validationErrorsChanged",
					ENABLE_EDITION_MODE: "enableEditionMode"
				},
				ownChannel: "form",
				persistenceChannel: "persistence"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function () {

			if (!this.modelChannel) {

				if (!this.modelSchema && !this.modelTarget) {
					console.error("Nor schema or target specified for model at form module '%s'", this.getChannel());
					return;
				}

				this.modelConfig = this._merge([{
					parentChannel: this.getChannel(),
					schema: this.modelSchema,
					target: this.modelTarget
				}, this.modelConfig || {}]);

				this.modelInstance = new ModelImpl(this.modelConfig);

				this.modelChannel = this.modelInstance.getChannel();
			}
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("SAVED"),
				callback: "_subSaved"
			},{
				channel: this.getChannel("SET_METHOD"),
				callback: "_subSetMethod"
			},{
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel: this.getChannel("SET_PROPERTY_VALUE"),
				callback: "_subSetPropertyValue"
			},{
				channel: this.getChannel("GET_PROPERTY_VALUE"),
				callback: "_subGetPropertyValue"
			},{
				channel: this.getChannel("SET_DATA"),
				callback: "_subSetData"
			},{
				channel: this.getChannel("SUBMIT"),
				callback: "_subSubmit"
			},{
				channel: this.getChannel("CANCEL"),
				callback: "_subCancel"
			},{
				channel: this.getChannel("SERIALIZE"),
				callback: "_subSerialize"
			},{
				channel: this.getChannel("DISABLE_PROPERTY"),
				callback: "_subDisableProperty"
			},{
				channel: this.getChannel("ENABLE_PROPERTY"),
				callback: "_subEnableProperty"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.WAS_VALID),
				callback: "_subWasValid"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.GOT_PROPERTY_VALUE),
				callback: "_subGotPropertyValue"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.SERIALIZED),
				callback: "_subSerialized"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.VALIDATION_ERRORS_CHANGED),
				callback: "_subValidationErrorsChanged"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SUBMITTED',
				channel: this.getChannel("SUBMITTED")
			},{
				event: 'CANCELLED',
				channel: this.getChannel("CANCELLED")
			},{
				event: 'GOT_IS_VALID_STATUS',
				channel: this.getChannel("GOT_IS_VALID_STATUS")
			},{
				event: 'GOT_PROPERTY_VALUE',
				channel: this.getChannel("GOT_PROPERTY_VALUE")
			},{
				event: 'RESETTED',
				channel: this.getChannel("RESETTED")
			},{
				event: 'CLEARED',
				channel: this.getChannel("CLEARED")
			},{
				event: 'SERIALIZED',
				channel: this.getChannel("SERIALIZED")
			},{
				event: 'GET_IS_VALID_STATUS',
				channel: this._buildChannel(this.modelChannel, this.actions.IS_VALID)
			},{
				event: 'SET_PROPERTY_VALUE',
				channel: this._buildChannel(this.modelChannel, this.actions.SET_PROPERTY_VALUE)
			},{
				event: 'DESERIALIZE',
				channel: this._buildChannel(this.modelChannel, this.actions.DESERIALIZE)
			},{
				event: 'SERIALIZE',
				channel: this._buildChannel(this.modelChannel, this.actions.SERIALIZE)
			},{
				event: 'RESET',
				channel: this._buildChannel(this.modelChannel, this.actions.RESET)
			},{
				event: 'CLEAR',
				channel: this._buildChannel(this.modelChannel, this.actions.CLEAR)
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CANCEL', lang.hitch(this, this._cancel));
			this._onEvt('SHOW', lang.hitch(this, this._shown));
			this._onEvt('DISCONNECT', lang.hitch(this, this._disconnect));
			this._onEvt('CONNECT', lang.hitch(this, this._connect));

			this._onEvt('RESIZE', lang.hitch(this, this._ancestorResized));
		},

		_subSaved: function(/*Object*/ res) {

			this._emitEvt('ENABLE_BUTTONS');

			var success = res.success,
				reset = res.reset,
				clear = res.clear,
				hide = res.hide;

			if (!success) {
				return;
			}

			reset && this._reset();

			if (clear || success) {
				this._clear();
			}

			hide && this._hide();
		},

		_subSerialize: function() {

			this._serialize();
		},

		_subDisableProperty: function(obj) {

			this._disableProperty(obj.property);
		},

		_subEnableProperty: function(obj) {

			this._enableProperty(obj.property);
		},

		_subSetMethod: function(/*Object*/ req) {

			this._setMethod(req);
		},

		_subReset: function(/*Object*/ req) {

			this._reset();
		},

		_subClear: function(/*Object*/ req) {

			this._clear();
		},

		_subSetPropertyValue: function(/*Object*/ req) {

			var propertyName = req.propertyName,
				value = req.value;

			propertyName && this._setPropertyValue(propertyName, value);
		},

		_subGetPropertyValue: function(/*Object*/ req) {

			this._publish(this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_VALUE), req);
		},

		_subSetData: function(/*Object*/ req) {

			var toInitValues = true;

			if (req.toInitValues !== undefined) {
				toInitValues = req.toInitValues;
			}

			this._setData(req.data, req.toInitValues, req.keepAllData || false);
		},

		_subSubmit: function() {

			this._submit();
		},

		_subCancel: function() {

			this._cancel();
		},

		_subWasValid: function(res) {

			this._wasValid(res);
		},

		_subGotPropertyValue: function(res) {

			this._emitEvt('GOT_PROPERTY_VALUE', res);
		},

		_subSerialized: function(res) {

			if (this._submitDfd && !this._submitDfd.isFulfilled()) {
				this._submitDfd.resolve(res);
			} else {
				this._emitEvt('SERIALIZED', res);
			}
		},

		_subValidationErrorsChanged: function(res) {

			var errors = res.errors || {};

			this._validationErrorsChanged(errors);
		}
	});
});
