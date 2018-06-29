define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment/moment.min'
], function(
	declare
	, lang
	, moment
){
	return declare(null, {
		//	summary:
		//		Extensión para establecer una relación de dependencia con otro campo.

		constructor: function(args) {

			this.config = {
				propertyNameDependence: "name",
				valueDependence: null,
				dependenceActions: {
					DEPENDENCE_VALUE_CHANGED: "dependenceValueChanged"
				}
			};

			lang.mixin(this, this.config, args);

			this._onEvt('VALUE_CHANGED', this._onValueChanged);
		},

		_mixEventsAndActions: function () {

			this.inherited(arguments);

			lang.mixin(this.actions, this.dependenceActions);

			delete this.dependenceActions;
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this.getChannel("DEPENDENCE_VALUE_CHANGED"),
				callback: "subDependenceValueChanged"
			});
		},

		_showWrapper: function(req) {

			this.inherited(arguments);

			if (this._inputProps.dependenceType === "hidden") {
				if (!this._objDependence || !this._objDependence.value || (this._inputProps.callbackDependence &&
					!this._inputProps.callbackDependence(this._objDependence.value))) {

					this._clear();
					this._hideWrapper();
				}
			}
		},

		subDependenceValueChanged: function(res) {

			if (this.valueDependence === res.value) {
				return;
			}

			this._dependenceWithInput(res);

			this._dependenceValueChanged(res);

			if (this._inputProps.targetDependence) {
				this._dependenceIdProperty && this._dependenceIdProperty(res);
			}
		},

		_dependenceValueChanged: function(res) {

			var type = this._inputProps.dependenceType;

			this._dependenceValueChangedWithAction(res, type);

			if (this._dependenceValueChangedWithNoType(res, type)) {
				return;
			}

			if (this._dependenceValueChangedWithUnique(res, type)) {
				return;
			}

			if (this._dependenceValueChangedWithHidden(res, type)) {
				return;
			}

			if (this._dependenceValueChangedWithStartDateOrEndDate(res, type)) {
				return;
			}
		},

		_dependenceValueChangedWithAction: function(res, type) {

			var action = this._inputProps.dependenceAction;

			this._actionsByValueDependence && this._actionsByValueDependence(res, type, action);
		},

		_dependenceValueChangedWithNoType: function(res, type) {

			if (!type) {
				if (res.isValid) {
					this._enable();
				} else {
					this._disable();
					this._clear();
				}

				return true;
			}
		},

		_dependenceValueChangedWithUnique: function(res, type) {

			if (type === "unique") {
				if (res.value) {
					this._disable();
				} else {
					this._enable();
				}

				return true;
			}
		},

		_dependenceValueChangedWithHidden: function(res, type) {

			var value = res.value,
				property = this._inputProps.propertyDependenceHidden;

			if (type === "hidden") {
				if (value && (!property || this._inputProps.valueDependenceHidden === value[property])) {
					this._hideActiveInNotUse = false;
					this._showWrapper();
				} else {
					this._hideActiveInNotUse = true;
					this._clear();
					this._hide();
				}
				return true;
			}
		},

		_dependenceValueChangedWithStartDateOrEndDate: function(res, type) {

			var ret = this.inherited(arguments);

			if (ret) {
				return;
			}

			if (this._inputInstance && this.valueDependence) {
				if (type === "endDate") {
					this._inputInstance.constraints.min = new Date(this.valueDependence);
				} else if (type === "startDate") {
					this._inputInstance.constraints.max = new Date(this.valueDependence);
				}
			}
		},

		_onValueChanged: function(obj) {

			if (this._inputProps.dependenceType === "unique") {

				var action;

				if (obj.isValid && obj.value && obj.value !== '') {
					action = 'DISABLE_PROPERTY';
				} else {
					action = 'ENABLE_PROPERTY';
				}

				this._publish(this.getParentChannel(action), {
					propertyName: this._inputProps.propertyNameDependence
				});
			}
		},

		_dependenceWithInput: function(res) {

			this.valueDependence = res.value;
			this._objDependence = res;
		},

		_emitSetValue: function(obj) {

			this._valueInput = obj[this.propertyName];

			var entry = true;

			if (this._inputProps.dependenceType === "hidden" && this._hideActiveInNotUse) {
				entry = false;
			}

			entry && this.inherited(arguments);

			this._hideActiveInNotUse = false;
		},

		_emitChanged: function(value) {

			var isValid = this._isValid,
				obj = {
					name: this.propertyName,
					value: value
				};

			isValid = this._validateDependences(value, isValid);

			if (!this.modelChannel) {
				this._validateWithoutModel(value);
				obj.checked = true;
			}

			obj.isValid = isValid;
			this._isValid = isValid;

			this._inputInstance && this._inputInstance.validate && this._inputInstance.validate();

			this._emitEvt('VALUE_CHANGED', obj);
		},

		_validateDependences: function(value, isValid) {

			if (this._inputProps.requiredWithDependence) {
				isValid = this._validateRequiredWithDependence(value, isValid);
			}

			if (this._inputProps.dependenceType === "endDate") {
				isValid = this._validateStartDate(value, isValid);
			}

			if (this._inputProps.dependenceType === "startDate") {
				isValid = this._validateEndDate(value, isValid);
			}

			if (this._inputProps.dependenceType === "maxValue") {
				isValid = this._validateMinValue(value, isValid);
			}

			if (this._inputProps.dependenceType === "minValue") {
				isValid = this._validateMaxValue(value, isValid);
			}

			return isValid;
		},

		_validateRequiredWithDependence: function(value, isValid) {

			if (this._isValid && this._objDependence && this._objDependence.value) {
				if (value) {
					return true;
				} else {
					return false;
				}
			}

			return isValid;
		},

		_validateStartDate: function(value, isValid) {

			if (value && this._objDependence && this._objDependence.value) {
				var method = this._inputProps.dependenceDateWithEquals ? 'isSameOrBefore' :'isBefore';
				if (moment(this._objDependence.value)[method](value)) {
					return true;
				} else {
					return false;
				}
			}

			return isValid;
		},

		_validateEndDate: function(value, isValid) {


			if (value && this._objDependence && this._objDependence.value) {
				var method = this._inputProps.dependenceDateWithEquals ? 'isSameOrAfter' :'isAfter';
				if (moment(this._objDependence.value)[method](value)) {
					return true;
				} else {
					return false;
				}
			}

			return isValid;
		},

		_validateMinValue: function(value, isValid) {

			if (value && this._objDependence && this._objDependence.value) {
				if (!value || value > this._objDependence.value) {
					return true;
				} else {
					return false;
				}
			}

			return isValid;
		},

		_validateMaxValue: function(value, isValid) {

			if (value && this._objDependence && this._objDependence.value) {
				if (!value || value < this._objDependence.value) {
					return true;
				} else {
					return false;
				}
			}

			return isValid;
		}
	});
});
