define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function(
	declare
	, lang
	, aspect
	, put
){
	return declare(null, {
		//	summary:
		//		Extensión para el módulo Input que permite añadir el botón para deshabilitar.

		constructor: function(args) {

			this.config = {
				_disableInputActive: true,
				_inputDisabled: false,
				notIcon: false
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_createInputNodes", lang.hitch(this, this._createDisableInputNodes));
			aspect.after(this, "_createNodesAndInstance", lang.hitch(this, this._afterCreateNodesAndInstance));
			aspect.after(this, "_enable", lang.hitch(this, this._enableInput));
			aspect.after(this, "_disable", lang.hitch(this, this._disableInput));
		},

		_afterCreateNodesAndInstance: function() {

			if (this._inputProps.isDisableInput) {
				this._createSwitchDisable();
			}
		},

		_createSwitchDisable: function() {

			if (this.containerSwitchDisable) {

				this.containerSwitchDisable.onclick = lang.hitch(this, this._onClickSwitchDisable);

				this._inputDisabled ? this._disable() : this._enableButton();
			}
		},

		_onClickSwitchDisable: function() {

			if (this._inputDisabled) {
				this._enable();
			} else {
				this._disable();
			}
		},

		_enableInput: function() {

			this._enableButton();

			this._inputDisabled = false;

			if (this._noEmitSetValueDisableInput) {
				return;
			}

			this._valueInputBeforeDisable && this._emitSetValue(this._valueInputBeforeDisable);
		},

		_enableButton: function() {

			if (this._inputProps.isDisableInput && this.containerSwitchDisable) {

				put(this.containerSwitchDisable, '!fa-toggle-off');
				put(this.containerSwitchDisable, '.fa-toggle-on');
				put(this.containerSwitchDisable, '[title=$]', this.i18n.disable);
			}
		},

		_disableInput: function() {

			this._disableButton();

			this._inputDisabled = true;

			if (this._noEmitSetValueDisableInput) {
				return;
			}

			this._valueInputBeforeDisable = this._lastEmitSetValue;

			var obj = {};
			obj[this.propertyName] = null;

			this._emitSetValue(obj);
		},

		_disableButton: function() {

			if (this._inputProps.isDisableInput && this.containerSwitchDisable) {

				put(this.containerSwitchDisable, '.fa-toggle-off');
				put(this.containerSwitchDisable, '!fa-toggle-on');
				put(this.containerSwitchDisable, '[title=$]', this.i18n.enable);
			}
		},

		_createDisableInputNodes: function() {

			if (!this.containerLeft) {
				return;
			}

			if (!this.notIcon) {
				this.containerSwitchDisable = put(this.containerLeft, "div.containerDisableSwitch.fa");
			}

			if (!this._inputProps.required) {
				this._isDisableInput = true;
				this._inputProps.isDisableInput = true;
			}
		}
	});
});
