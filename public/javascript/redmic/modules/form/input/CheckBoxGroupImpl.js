define([
	"dijit/form/CheckBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/Input"
	, "RWidgets/Utilities"
], function(
	CheckBox
	, declare
	, lang
	, put
	, Input
	, Utilities
){
	return declare(Input, {
		//	summary:
		//		Implementación de input CheckBoxGroup.

		constructor: function(args) {

			this.config = {
				_inputProps: {
					notLabel: true,
					minChecked: 0,
					checked: null
				},
				propertyName: "name",
				noTranslateLabel: false,
				ownChannel: "checkBoxGroup",
				valuePropertyName: "checked",
				_inputs: [],
				_labelInputs: [],
				values: {}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (!this._inputProps.labels)
				this._inputProps.labels = this._inputProps.values;

			this.containerInput = this.domNode;

			put(this.domNode, ".inputContainer.fWidth");
		},

		_createInputInstance: function() {

			if (this._inputProps.labels && this._inputProps.labels.length && this._inputProps.values &&
				this._inputProps.values.length) {

				for (var i = 0; i < this._inputProps.labels.length; i++) {
					this._createMiniInput(i);
				}
			}

			return false;
		},

		_createInputNodes: function() {

			if (!this._inputProps.required)
				this._isValid = true;
		},

		_createMiniInput: function(i) {

			var propsInput = {
				onChange: lang.hitch(this, this._setValue, i),
				trim: true,
				value: this._inputProps.values[i],
				name: this._inputProps.labels[i],
				checked: this._inputProps.checked ? this._inputProps.checked[i] : false,
				disabled: this._inputProps.disabled ? this._inputProps.disabled[i] : false
			};

			var nodeMiniInput = put(this.containerInput, 'div.inputContainer.noWrap.fWidth');
			this._createLabelMiniInput(this._inputProps.labels[i], nodeMiniInput, i);
			var containerMiniInput = put(nodeMiniInput, "div.rightContainer");

			this._inputs[i] = new CheckBox(propsInput).placeAt(containerMiniInput);
			this.values[this._inputProps.values[i]] = propsInput.checked;

			if (this._inputProps.descriptions)
				put(containerMiniInput, 'span[title=$].separateLeft.fa.fa-info-circle', this._inputProps.descriptions[i]);
		},

		_createLabelMiniInput: function(/*String*/ label, node, i) {
			//	summary:
			//		Crea el label asociado al input definido por los parámetros.
			//	tags:
			//		private

			label = (this.i18n[label] && !this.noTranslateLabel) ? this.i18n[label] : label;

			this._labelInputs[i] = put(node, 'div.leftContainer label', label);
		},

		_setValue: function(i, value) {

			this.values[this._inputProps.values[i]] = value;

			var obj = {};

			obj[this.propertyName] = [];

			for (var key in this.values){
				if (this.values[key]) {
					obj[this.propertyName].push(this._formatValueSetItem(key));
				}
			}

			if (this._inputProps.minChecked && obj[this.propertyName].length < this._inputProps.minChecked) {
				this.minCheckedActive = true;
				this._inputs[i].set('value', true);
			} else if (this.minCheckedActive)
				this.minCheckedActive = false;
			else {
				this._emitActiveSetValue = true;
				this._emitSetValue(obj);
			}
		},

		_valueChanged: function(obj) {

			var resultList = obj[this.propertyName];

			if (!this._emitActiveSetValue) {
				for (var key in this.values)
					this.values[key] = false;

				for (var i = 0; i < resultList.length; i++)
					this.values[this._getValueItem(resultList[i])] = true;

				for (i = 0; i < this._inputs.length; i++)
					this._inputs[i].set(this.valuePropertyName, this.values[this._inputProps.values[i]]);
			} else
				this._emitActiveSetValue = false;

			this._emitChanged(obj[this.propertyName]);
		},

		_getValueItem: function(item) {

			var propertyPath = this._inputProps.propertyPath;

			if (propertyPath)
				return Utilities.getDeepProp(item, propertyPath);

			return item;
		},

		_formatValueSetItem: function(value) {

			var propertyPath = this._inputProps.propertyPath,
				itemDefault = (this._inputProps.propertyPath && this._inputProps.itemDefault) || null,
				item = value;

			if (itemDefault) {
				item =lang.clone(itemDefault);
				item = Utilities.setDeepProp(item, propertyPath, value);
			}

			return item;
		},

		_updateIsValid: function(obj) { // cambiar

			if (obj && obj[this.propertyName])
				this._isValid = false;
			else
				this._isValid = true;
		},

		subGotPropertyInstance: function(request) {

		},

		_enable: function(obj) {

			for (var i = 0; i < this._inputs.length; i++) {
				this._inputs[i].set("disabled", false);
				obj && obj.label && put(this._labelInputs[i], {
					style: "opacity: 1;"
				});
			}
		},

		_disable: function(obj) {

			for (var i = 0; i < this._inputs.length; i++) {
				this._inputs[i].set("disabled", true);
				obj && obj.label && put(this._labelInputs[i], {
					style: "opacity: 0.5;"
				});
			}
		},

		_reset: function() {

			this._clear();
		},

		_clear: function() {

			for (var i = 0; i < this._inputs.length; i++) {
				this._inputs[i].set(this.valuePropertyName, false);
			}
		}
	});
});