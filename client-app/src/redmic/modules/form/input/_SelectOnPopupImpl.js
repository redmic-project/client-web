define([
	'src/redmicConfig'
	, "dijit/form/ValidationTextBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/Input"
], function(
	redmicConfig
	, ValidationTextBox
	, declare
	, lang
	, put
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input.

		constructor: function(args) {

			this.config = {
				propertyName: "classification",
				ownChannel: "selectOnPopup",
				idProperty: "id",

				_inputProps: {
					disabled: true,
					labelAttr: "name"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_mixinInputProps: function() {

			lang.mixin(this._inputProps, {
				isValid: lang.hitch(this, this._validate),
				onClick: lang.hitch(this, this._showContentInPopup)
			}, this.inputProps);

			if (this._inputProps.target) {
				this.target = redmicConfig.services[this._inputProps.target] || this._inputProps.target;
			}

			if (this._inputProps.idProperty) {
				this.idProperty = this._inputProps.idProperty;
			}

			if (!this._inputProps.placeHolder) {
				this._inputProps.placeHolder = 'selectOnPopupPlaceHolderInput';
			}

			this._inputProps.placeHolder = this.i18n[this._inputProps.placeHolder] ?
					this.i18n[this._inputProps.placeHolder] : this._inputProps.placeHolder;
		},

		_getInfoFromInstance: function(instance) {

			this.inherited(arguments);

			this.target = this._inputProps.target;
		},

		_createInputInstance: function() {

			put(this.containerInput, ".selectOnPopup");

			var widget = new ValidationTextBox(this._inputProps).placeAt(this.containerInput);

			this._cleanInputNode = put(this.containerInput, "i.fa.fa-times.cleanInput.hidden");
			this._cleanInputNode.onclick = lang.hitch(this, this._cleanInput);

			return widget;
		},

		_showContentInPopup: function() {

		},

		_valueChanged: function(res) {

			if ((res.value === undefined && res[this.propertyName] === undefined) ||
				this.propertyName === this.getChannel()) {
				return;
			}

			var value = res.value || res[this.propertyName];

			if (this._value !== value) {
				this._setInput(value);
			}

			this._emitChanged(value);
		},

		_setValue: function(value) {

			this._evaluateValue(value);

			this._value = value;

			var obj = {};
			obj[this.propertyName] = this._getValueToSet(value);

			this._emitSetValue(obj);
		},

		_setInput: function(value) {

			this._inputInstance && this._inputInstance.set(this.valuePropertyName, value);

			this._setValue(value);
		},

		_cleanInput: function(value) {

			this._setInput(null);
		},

		_evaluateValue: function(value) {

			if (value) {
				this._showCleanNode();
			} else {
				this._hideCleanNode();
			}
		},

		_hideCleanNode: function() {

			put(this._cleanInputNode, ".hidden");
		},

		_showCleanNode: function() {

			put(this._cleanInputNode, "!hidden");
		},

		_clear: function() {

			this._inputInstance && this._cleanInput();

			this._value = null;
		},

		_reset: function() {

			this._inputInstance && this._setInput(this.initValue);
		}
	});
});
