define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "RWidgets/Switch"
	, "./_NodesCreation"
	, "./_InputItfc"
], function(
	declare
	, lang
	, aspect
	, Deferred
	, _Module
	, _Show
	, Switch
	, _NodesCreation
	, _InputItfc
){
	return declare([_Module, _InputItfc, _Show, _NodesCreation], {
		//	summary:
		//		Módulo para componentes de entrada de datos por parte del usuario.

		constructor: function(args) {

			this.config = {
				events: {
					SET_VALUE: "setValue",
					SET_PROPERTY_VALUE: "setPropertyValue",
					GET_PROPERTY_VALUE: "getPropertyValue",
					VALUE_CHANGED: "valueChanged",
					GET_PROPERTY_INSTANCE: "getPropertyInstance",
					SUBMITTED: "submitted",
					IS_VALID: "isValid"
				},
				actions: {
					SET_VALUE: "setValue",
					SET_PROPERTY_VALUE: "setPropertyValue",
					GET_PROPERTY_VALUE: "getPropertyValue",
					GOT_PROPERTY_VALUE: "gotPropertyValue",
					VALUE_CHANGED: "valueChanged",
					IS_VALID: "isValid",
					WAS_VALID: "wasValid",
					VALIDATION_ERRORS_CHANGED: "validationErrorsChanged",
					GET_PROPERTY_INSTANCE: "getPropertyInstance",
					GOT_PROPERTY_INSTANCE: "gotPropertyInstance",
					SUBMIT: "submit",
					SUBMITTED: "submitted",
					ENABLE: "enable",
					DISABLE: "disable",
					RESET: "reset",
					CLEAR: "clear",
					ENABLE_PROPERTY: "enableProperty",
					DISABLE_PROPERTY: "disableProperty",
					ENABLE_EDITION_MODE: "enableEditionMode",
					EMBED_ELEMENT: "embedElement"
				},

				valuePropertyName: "value",
				initValue: null,

				_isValid: false,

				_inputProps: {
					isDisableInput: false
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_initialize", lang.hitch(this, this._initializeInput));
			aspect.after(this, "_enable", lang.hitch(this, this.enableLabel));
			aspect.after(this, "_disable", lang.hitch(this, this.disableLabel));
			aspect.before(this, "_emitSetValue", lang.hitch(this, this._beforeEmitSetValue));
			aspect.before(this, "_emitChanged", lang.hitch(this, this._beforeEmitChanged));
		},

		postMixInProperties: function() {

			this.inherited(arguments);

			this._mixinInputProps();
		},

		_mixinInputProps: function() {

			lang.mixin(this._inputProps, {
				onChange: lang.hitch(this, this._setValue),
				isValid: lang.hitch(this, this._validate)
			}, this.inputProps);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._shown));
			this._onEvt('HIDE', lang.hitch(this, this.hideLabel));
		},

		_initializeInput: function() {

			if (!this.modelChannel) {
				this._createNodesAndInstance();
			}
		},

		_defineSubscriptions: function() {

			if (this.modelChannel) {
				this._validationChannel = this.modelChannel;
			} else {
				this._validationChannel = this.getChannel();
			}

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this._validationChannel, this.actions.VALUE_CHANGED),
				callback: "_subValueChanged",
				options: {
					predicate: lang.hitch(this, function(res) {

						return this._chkInputInstanceExists(res) && this._chkContainedPropertyIsMine(res);
					})
				}
			},{
				channel: this.getChannel("SUBMIT"),
				callback: "_subSubmit"
			},{
				channel: this.getChannel("EMBED_ELEMENT"),
				callback: "_subEmbedElement"
			},{
				channel: this.getChannel("ENABLE"),
				callback: "_subEnable"
			},{
				channel: this.getChannel("DISABLE"),
				callback: "_subDisable"
			},{
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel: this.getChannel("ENABLE_EDITION_MODE"),
				callback: "_subEnableEditionMode"
			});

			if (!this.modelChannel) {
				this.subscriptionsConfig.push({
					channel: this.getChannel("SET_VALUE"),
					callback: "_subSetValue",
					options: {
						predicate: lang.hitch(this, this._chkContainedPropertyIsMine)
					}
				});
			} else {
				this.subscriptionsConfig.push({
					channel: this._buildChannel(this.modelChannel, this.actions.WAS_VALID),
					callback: "_subWasValid"
				},{
					channel: this._buildChannel(this.modelChannel, this.actions.VALIDATION_ERRORS_CHANGED),
					callback: "_subWasValid"
				},{
					channel: this._buildChannel(this._validationChannel, this.actions.GOT_PROPERTY_INSTANCE),
					callback: "_subGotPropertyInstance",
					options: {
						predicate: lang.hitch(this, this._chkPropertyNameIsMine),
						calls: 1
					}
				},{
					channel: this._buildChannel(this._validationChannel, this.actions.GOT_PROPERTY_VALUE),
					callback: "_subGotPropertyValue",
					options: {
						predicate: lang.hitch(this, function(res) {

							return this._chkInputInstanceExists(res) && this._chkPropertyNameIsMine(res);
						})
					}
				});
			}
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'VALUE_CHANGED',
				channel: this.getChannel("VALUE_CHANGED")
			},{
				event: 'SUBMITTED',
				channel: this.getChannel("SUBMITTED")
			},{
				event: 'SET_PROPERTY_VALUE',
				channel: this._buildChannel(this._validationChannel, this.actions.SET_PROPERTY_VALUE)
			});

			if (this.modelChannel) {
				this.publicationsConfig.push({
					event: 'GET_PROPERTY_INSTANCE',
					channel: this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_INSTANCE)
				},{
					event: 'GET_PROPERTY_VALUE',
					channel: this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_VALUE)
				},{
					event: 'IS_VALID',
					channel: this._buildChannel(this.modelChannel, this.actions.IS_VALID)
				});
			} else {
				this.publicationsConfig.push({
					event: 'SET_VALUE',
					channel: this._buildChannel(this._validationChannel, this.actions.SET_VALUE)
				});
			}
		},

		postCreate: function() {

			if (this._inputProps.disable) {
				aspect.after(this, "_emitSetValue", lang.hitch(this, this._disableInitOnce));
				this._activeDisabledOnce = true;
			}

			this.inherited(arguments);

			this._propertyInstance();
		},

		_propertyInstance: function() {

			if (this.modelChannel) {
				this._emitEvt("GET_PROPERTY_INSTANCE", {
					key: this.propertyName
				});
			}
		},

		_getValue: function() {

			return this._lastEmitSetValue && this._lastEmitSetValue[this.propertyName];
			//return this._inputInstance.get("value");
		},

		_setValue: function(value) {

			var obj = {};
			obj[this.propertyName] = this._getValueToSet(value);

			this._emitSetValue(obj);
		},

		_disableInitOnce: function() {

			if (this._activeDisabledOnce) {
				delete this._activeDisabledOnce;
				this._disable();
			}
		},

		_getValueToSet: function(value) {

			if (typeof value === "string" && !value.length) {
				return null;
			}

			return value;
		},

		_validate: function() {

			return !!this._isValid;
		},

		_createNodesAndInstance: function() {

			this._createInputNodes();
			this._inputInstance = this._createInputInstance();

			if (this.dfdBeforeShow)
				this.dfdBeforeShow.resolve();

			this._linkLabelToInput();
		},

		_subValueChanged: function(res) {

			this._valueChanged(res);
		},

		_subSubmit: function(req) {

			this._submit(req);
		},

		_subEmbedElement: function(req) {

			this._embedElement(req);
		},

		_subWasValid: function(res) {

			var isValid = this._isValid;

			if (res && res.propertyName) {
				this._updatePropertyIsValid(res);
			} else {
				this._updateIsValid(res);
			}

			if (isValid !== this._isValid && this._lastEmitSetValue) {
				this._lastEmitSetValue.isValid = this._isValid;
				this._emitEvt('VALUE_CHANGED', this._lastEmitSetValue);
			}
		},

		_subSetValue: function(req) {

			var value = req[this.propertyName];

			if (req.toInitValue) {
				this.initValue = value;
			}

			this._valueChanged(req);
		},

		_emitSetValue: function(obj) {

			this._getShown() && this._emitEvt(this.modelChannel ? 'SET_PROPERTY_VALUE' : 'SET_VALUE', obj);
		},

		_beforeEmitSetValue: function(obj) {

			this._lastEmitSetValue = lang.clone(obj);
		},

		_beforeEmitChanged: function(value) {

			var obj = {};
			obj[this.propertyName] = value;

			this._lastEmitSetValue = obj;
		},

		_subGotPropertyValue: function(res) {

			this._gotPropertyValue(res);
		},

		_gotPropertyValue: function(res) {

			var obj = {};
			obj[this.propertyName] = res.value;
			this._isValid = res.isValid;

			this._valueChanged(obj);
		},

		_subGotPropertyInstance: function(res) {

			var instance = res.instance;

			this.propertyPath = res.propertyPath;

			this._getInfoFromInstance(instance);
			this._createNodesAndInstance();

			if (this._inputInstance) {
				this._inputInstance.validator = lang.hitch(this, function(instance) {

					return instance.get("isValid");
				}, instance);
			}

			if (this.propertyName !== this.getChannel()) {
				this._emitEvt("GET_PROPERTY_VALUE", {
					propertyName: this.propertyName
				});
			}
		},

		_beforeShow: function(req) {

			if (this._inputInstance !== undefined) {
				return;
			}

			this.dfdBeforeShow = new Deferred();

			return this.dfdBeforeShow;
		},

		_getInfoFromInstance: function(instance) {

			this._inputProps.required = instance.get("isRequired");

			var schema = instance.get("schema");
			if (schema && schema.url && !this._inputProps.target) {
				this._inputProps.target = schema.url;
			}
		},

		_subEnable: function(res) {

			this._enable(res);
		},

		_subDisable: function(res) {

			this._disable();
		},

		_subReset: function() {

			this._doReset();
		},

		_doReset: function() {

			if (this.modelChannel && this.propertyName) {
				this._publish(this._buildChannel(this.modelChannel, this.actions.RESET), {
					properties: [this.propertyName]
				});
			} else {
				this._reset();
			}
		},

		_subClear: function() {

			this._doClear();
		},

		_doClear: function() {

			if (this.modelChannel && this.propertyName && this.propertyName !== this.getChannel()) {
				this._publish(this._buildChannel(this.modelChannel, this.actions.CLEAR), {
					properties: [this.propertyName]
				});
			} else {
				this._clear();
			}
		},

		_subEnableEditionMode: function() {

			this._enableEditionMode();
		},

		_updateIsValid: function(obj) {

			var errors = obj.errors || {};

			this._isValid = !(errors[this.propertyPath]);

			this._inputInstance && this._inputInstance.validate && this._inputInstance.validate();
		},

		_updatePropertyIsValid: function(obj) {

			if (obj.propertyName === this.propertyName) {
				this._isValid = obj.isValid;
				this._emitChanged(obj.value);
			}
		},

		_enable: function() {

			this._inputInstance && this._inputInstance.set("disabled", false);
		},

		_disable: function() {

			this._inputInstance && this._inputInstance.set("disabled", true);
		},

		_reset: function() {

			this._inputInstance && this._inputInstance.set(this.valuePropertyName, this.initValue);
		},

		_clear: function() {

			this._inputInstance && this._inputInstance.set(this.valuePropertyName, null);
		},

		_shown: function() {

			this._emitEvt('GET_PROPERTY_VALUE', {
				propertyName: this.propertyName
			});

			this.showLabel();
		},

		_chkInputInstanceExists: function(res) {

			return !!this._inputInstance || this._inputInstance === false;
		},

		_chkContainedPropertyIsMine: function(res) {

			return this._containedPropertyIsMine(res) && (!res.checked);
		},

		_containedPropertyIsMine: function(obj) {

			return this.propertyName === undefined || obj[this.propertyName] !== undefined;
		},

		_chkPropertyNameIsMine: function(res) {

			return res.propertyName === this.propertyName;
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			this._inputInstance && this._inputInstance.set(this.valuePropertyName, value);
			this._emitChanged(value);
		},

		_emitChanged: function(value) {

			var obj = {
				name: this.propertyName,
				value: value,
				isValid: this._isValid
			};

			if (!this.modelChannel) {
				this._validateWithoutModel(value);
				obj.checked = true;
			}

			this._emitEvt('VALUE_CHANGED', obj);
		},

		_validateWithoutModel: function(value) {

			this._isValid = this._inputProps.required ? !!value : true;
		},

		_enableEditionMode: function() {

			if (this._inputProps.noEditable) {
				this._disable();
			}
		},

		_submit: function(req) {

			this._emitSubmitted({
				success: true
			});
		},

		_emitSubmitted: function(obj) {

			obj.propertyName = this.propertyName;
			this._emitEvt('SUBMITTED', obj);
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});