define([
	"dijit/form/NumberTextBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "redmic/modules/form/input/Input"
	, "RWidgets/Converter"
], function(
	NumberTextBox
	, declare
	, lang
	, Utilities
	, Input
	, Converter
){
	return declare(Input, {
		//	summary:
		//		Implementación de input GeographicCoordinate.

		constructor: function(args) {

			this.config = {
				_inputProps: {
					//intermediateChanges: true,
					"class": "form-control",
					constraints: {
						places: '0,20',
						max: 9000000000000000,
						min: -9000000000000000
					}
				},
				_dInputProps: {},
				_mInputProps: {},
				_sInputProps: {
					constraints: {
						places: '0,10'
					}
				},
				propertyName: "name",
				ownChannel: "geographicCoordinate"
			};

			lang.mixin(this, this.config, args);
		},

		_mixinInputProps: function() {

			this.inherited(arguments);

			this._dInputProps = this._merge([this._inputProps, this._dInputProps, this.dInputProps || {}]);

			this._mInputProps = this._merge([this._inputProps, this._mInputProps, this.mInputProps || {}]);

			this._sInputProps = this._merge([this._inputProps, this._sInputProps, this.sInputProps || {}]);
		},

		_createInputInstance: function() {

			this.containerInput.className += " geographicCoordinate";

			this._createMiniInput('degrees');
			this._createMiniInput('minutes');
			this._createMiniInput('seconds');

			return false;
		},

		_createMiniInput: function(key) {

			var placeholder = key + "PlaceHolder",
				unitPrefix = '_' + key[0],
				inputProps = this[unitPrefix + 'InputProps'],
				props = {};

			lang.mixin(props, inputProps);

			lang.mixin(props, {
				placeHolder: this.i18n[placeholder in this.i18n ? placeholder : key],
				propertyName: key
			});

			props.onChange = lang.partial(props.onChange, key);

			this[unitPrefix + 'Widget'] = new NumberTextBox(props).placeAt(this.containerInput);
		},

		_setValue: function(key, value) {

			this._spreadDecimalValue(key, value);

			var dValue = this._dWidget.get(this.valuePropertyName),
				mValue = this._mWidget.get(this.valuePropertyName),
				sValue = this._sWidget.get(this.valuePropertyName),
				obj = {};

			obj[this.propertyName] = Converter.DMS2DD(dValue, mValue, sValue);

			this._emitSetValue(obj);
		},

		_spreadDecimalValue: function(key, value) {

			if (!Utilities.isValidNumber(value)) {
				return;
			}

			if (key === 'seconds') {
				this._sWidget.set(this.valuePropertyName, value);
				return;
			}

			var decimalPart = Math.abs(value % 1),
				integerPart = Math.trunc(value);

			if (key === 'degrees') {
				if (this._dWidget.get(this.valuePropertyName) !== integerPart) {
					this._dWidget.set(this.valuePropertyName, integerPart);
					this._spreadDecimalValue('minutes', decimalPart * 60);
				}
			} else if (key === 'minutes') {
				if (this._mWidget.get(this.valuePropertyName) !== integerPart) {
					this._mWidget.set(this.valuePropertyName, integerPart);
					this._spreadDecimalValue('seconds', decimalPart * 60);
				}
			}
		},

		_valueChanged: function(obj) {

			var value = obj[this.propertyName],
				translatedObj = Converter.DD2DMS(value);

			if (translatedObj) {
				this._dWidget.set(this.valuePropertyName, translatedObj.degrees);
				this._mWidget.set(this.valuePropertyName, translatedObj.minutes);
				this._sWidget.set(this.valuePropertyName, translatedObj.seconds);
			}
		},

		_updateIsValid: function(obj) {

			this.inherited(arguments);

			this._dWidget && this._dWidget.validate && this._dWidget.validate();
			this._mWidget && this._mWidget.validate && this._mWidget.validate();
			this._sWidget && this._sWidget.validate && this._sWidget.validate();
		},

		_enable: function() {

			this._dWidget.set("disabled", false);
			this._mWidget.set("disabled", false);
			this._sWidget.set("disabled", false);
		},

		_disable: function() {

			this._dWidget.set("disabled", true);
			this._mWidget.set("disabled", true);
			this._sWidget.set("disabled", true);
		},

		_reset: function() {

			this._doClear();
		},

		_doClear: function() {

			this._dWidget.set(this.valuePropertyName, null);
			this._mWidget.set(this.valuePropertyName, null);
			this._sWidget.set(this.valuePropertyName, null);
		}
	});
});