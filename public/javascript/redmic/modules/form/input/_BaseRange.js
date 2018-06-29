define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/Input"
	, "redmic/modules/form/input/_Dependence"
	, "redmic/modules/form/input/_DisableInput"
], function(
	declare
	, lang
	, Input
	, _Dependence
	, _DisableInput
){
	return declare(Input, {
		//	summary:
		//		Implementación de input GeographicCoordinate.

		constructor: function(args) {

			this.config = {
				_inputPropsBase: {

				},
				_minInputPropsBase: {
					_disableInputActive: false,
					labelProperty: 'min',
					inputProps: {
						propertyNameDependence: 'max',
						dependenceType: 'minValue',
						notFullWidth: true,
						notLabel: true
					}
				},
				_maxInputPropsBase: {
					_disableInputActive: false,
					labelProperty: 'max',
					inputProps: {
						propertyNameDependence: 'min',
						dependenceType: 'maxValue',
						notFullWidth: true,
						notLabel: true
					}
				},
				propertyName: "name",
				ownChannel: "range",

				_noEmitSetValueDisableInput: true
			};

			lang.mixin(this, this.config, args);
		},

		_mixinInputProps: function() {

			this.inherited(arguments);

			this._inputProps = this._merge([this._inputPropsBase, this._inputProps || {}]);

			this._minInputProps = this._merge([this._minInputPropsBase, this._minInputProps || {}]);
			this._minInputProps = this._merge([this._minInputProps, this.minInputProps || {}]);
			this._minInputProps = this._merge([this._inputProps.minInputProps || {}, this._minInputProps]);

			this._maxInputProps = this._merge([this._maxInputPropsBase, this._maxInputProps || {}]);
			this._maxInputProps = this._merge([this._maxInputProps, this.maxInputProps || {}]);
			this._maxInputProps = this._merge([this._inputProps.maxInputProps || {}, this._maxInputProps]);
		},

		_createInputInstance: function() {

			this.containerInput.className += " range";

			this._createMiniInput('min', this._minInputProps.labelProperty);
			this._createMiniInput('max', this._maxInputProps.labelProperty);

			this._subscribe(this._minWidget.getChannel('VALUE_CHANGED'), lang.hitch(this,
				function(obj) {

				this._publish(this._maxWidget.getChannel('DEPENDENCE_VALUE_CHANGED'), obj);
			}));

			this._subscribe(this._maxWidget.getChannel('VALUE_CHANGED'), lang.hitch(this,
				function(obj) {

				this._publish(this._minWidget.getChannel('DEPENDENCE_VALUE_CHANGED'), obj);
			}));

			return false;
		},

		_createMiniInput: function(key, labelProperty) {

			var placeholder = labelProperty + "PlaceHolder",
				inputProps = this['_' + key + 'InputProps'],
				props = {};

			inputProps.inputProps.propertyNameDependence = this.propertyName + '/' + inputProps.inputProps.propertyNameDependence;

			props = this._merge([props, inputProps, {
				parentChannel: this.getChannel(),
				inputProps: {
					placeHolder: this.i18n[placeholder in this.i18n ? placeholder : labelProperty]
				},
				propertyName: this.propertyName + '/' + labelProperty,
				modelChannel: this.modelChannel
			}]);

			var def = this.inputDef;

			if (this._isDisableInput) {
				def = declare([this.inputDef, _DisableInput]);
				props.notIcon = true;
			}

			this['_' + key + 'Widget'] = new declare([def, _Dependence])(props).placeAt(this.containerInput);

			this._publish(this['_' + key + 'Widget'].getChannel('SHOW'), {
				node: this.containerInput
			});

			this._subscribe(this['_' + key + 'Widget'].getChannel('VALUE_CHANGED'), lang.hitch(this,
				this._subValueChangedWidget, key));
		},

		_subValueChangedWidget: function(key, res) {

			if (res.isValid)
				this._emitEvt('IS_VALID', {
					propertyName: this.propertyName
				});
			else {
				this._isValid = false;
				this._emitChanged({});
			}
		},

		_enable: function() {

			this._publish(this._minWidget.getChannel('ENABLE'));
			this._publish(this._maxWidget.getChannel('ENABLE'));
		},

		_disable: function() {

			this._publish(this._minWidget.getChannel('DISABLE'));
			this._publish(this._maxWidget.getChannel('DISABLE'));
		},

		_reset: function() {

			this._doClear();
		},

		_doClear: function() {

			this._publish(this._minWidget.getChannel('CLEAR'));
			this._publish(this._maxWidget.getChannel('CLEAR'));
		},

		_disableInput: function() {

			this._disableButton();
		},

		_enableInput: function() {

			this._enableButton();
		}
	});
});