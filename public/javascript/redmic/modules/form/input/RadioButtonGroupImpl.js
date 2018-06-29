define([
	"dijit/form/RadioButton"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/Input"
], function(
	RadioButton
	, declare
	, lang
	, put
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input RadioButtonGroup.

		constructor: function(args) {

			this.config = {
				_inputProps: {
					notLabel: true,
					checked: null
				},
				propertyName: "name",
				ownChannel: "radioButtonGroup",
				valuePropertyName: "checked",
				_inputs: [],
				_labelInputs: []
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (!this._inputProps.labels)
				this._inputProps.labels = this._inputProps.values;

			this.containerInput = this.domNode;

			put(this.domNode, ".fWidth");
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
				name: this._inputProps.propertyName,
				checked: this._inputProps.values[i] === this._inputProps.checked ? true : false
			};

			var nodeMiniInput = put(this.containerInput, 'div.inputContainer.noWrap.fWidth');
			this._createLabelMiniInput(this._inputProps.labels[i], nodeMiniInput, i);
			var containerMiniInput = put(nodeMiniInput, "div.rightContainer");

			this._inputs[i] = new RadioButton(propsInput).placeAt(containerMiniInput);

			if (this._inputProps.descriptions)
				put(containerMiniInput, 'span[title=$].separateLeft.fa.fa-info-circle', this._inputProps.descriptions[i]);
		},

		_createLabelMiniInput: function(/*String*/ label, node, i) {
			//	summary:
			//		Crea el label asociado al input definido por los parámetros.
			//	tags:
			//		private

			label = this.i18n[label] ? this.i18n[label] : label;

			this._labelInputs[i] = put(node, 'div.leftContainer label', label);
		},

		_setValue: function(i, value) {

			if (value) {
				var obj = {};
				obj[this.propertyName] = this._inputProps.values[i];

				this._emitSetValue(obj);
			}
		},

		_valueChanged: function(obj) {

			var resultList = obj[this.propertyName];

			for (var i = 0; i < this._inputProps.values.length; i++) {
				if (this._inputProps.values[i] === obj[this.propertyName])
					this._inputs[i].set(this.valuePropertyName, true);
			}

			this._emitChanged(obj[this.propertyName]);
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

			for (var i = 0; i < this._inputProps.values.length; i++) {
				var input = this._inputs[i];
				if (this._inputProps.values[i] === this._inputProps.checked) {
					input.set(this.valuePropertyName, true);
				} else {
					input.set(this.valuePropertyName, false);
				}
			}
		},

		_clear: function() {

			for (var i = 0; i < this._inputProps.values.length; i++) {
				this._inputs[i].set(this.valuePropertyName, false);
			}
		}
	});
});