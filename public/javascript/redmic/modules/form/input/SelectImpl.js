define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/form/Select"
	, "redmic/modules/base/_Store"
	, "redmic/modules/form/input/Input"
], function(
	redmicConfig
	, declare
	, lang
	, aspect
	, Utilities
	, Select
	, _Store
	, Input
){
	return declare([Input, _Store], {
		//	summary:
		//		Implementación de input Select.

		constructor: function(args) {

			this.config = {
				ownChannel: "select",
				selectImplEvents: {
				},
				selectImplActions: {
					SET_OPTIONS: "setOptions"
				},

				_inputProps: {
					labelAttr: "label",
					idProperty: "value"
				},
				labelKeyPropertyName: "labelKey",
				propertyName: "name",
				includeEmptyValue: true,
				resetValue: false,
				pathSeparator: '.',
				_items: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixSelectImplEventsAndActions));
			aspect.after(this, "_defineSubscriptions", this._defineSelectImplSubscriptions);
			aspect.after(this, "_createNodesAndInstance", this._afterCreateInstance);
		},

		_initialize: function() {

			if (this._inputProps.target) {
				this.target = redmicConfig.services[this._inputProps.target] || this._inputProps.target;
			}

			if (this._inputProps.targetDependence) {
				this.target = redmicConfig.services[this._inputProps.targetDependence];
			}

			if (this._inputProps.includeEmptyValue === false) {
				this.includeEmptyValue = false;
			}
		},

		_mixSelectImplEventsAndActions: function () {

			lang.mixin(this.events, this.selectImplEvents);
			lang.mixin(this.actions, this.selectImplActions);
			delete this.selectImplEvents;
			delete this.selectImplActions;
		},

		_defineSelectImplSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SET_OPTIONS"),
				callback: "_subSetOptions"
			});
		},

		_createInputInstance: function() {

			var objConfig = lang.clone(this._inputProps);

			delete objConfig.options;

			var widget = new Select(objConfig).placeAt(this.containerInput);

			widget.startup();

			if (this._inputProps.options)
				this._addOptions(this._inputProps.options);

			return widget;
		},

		_afterCreateInstance: function() {

			if (this._optionsPending) {
				this._addOptions(this._optionsPending);
				this._optionsPending = null;
			}
		},

		_subSetOptions: function(req) {

			this._addOptions(req.options);
		},

		_shown: function() {

			this.propertyNameDependence && this.inherited(arguments);

			this.showLabel();

			if (this._inputProps.target && !this._inputProps.omitRequest && !this._inputProps.targetDependence)
				this._emitPost();
		},

		_dependenceIdProperty: function(res) {

			if (res.value)
				this._emitGet(res.value);
		},

		_emitGet: function(value) {

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: value
			});
		},

		_emitPost: function() {

			this._publish(this._buildChannel(this.storeChannel, this.actions.REQUEST), {
				target: this.target,
				method: 'POST',
				requesterId: this.getOwnChannel()
			});
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			this._valueInput = value;

			if (value && this._inputProps.valueIsObject)
				this._valueInput = Utilities.getDeepProp(value, this._inputProps.idProperty);

			if (this._valueInput && this._inputInstance)
				this._inputInstance.set(this.valuePropertyName, this._valueInput);
			else
				this._inputInstance.reset();

			this._emitChanged(value);
		},

		_setValue: function(value) {

			if (this._valueInput === value)
				return;

			if (value && this._inputProps.valueIsObject)
				value = this._items[value];

			var obj = {};
			obj[this.propertyName] = this._getValueToSet(value);

			this._emitSetValue(obj);
		},

		_addOptions: function(items) {

			if (!this._inputInstance) {
				this._optionsPending = items;
				return;
			}

			this._items = {};

			this._inputInstance.set('options', []);

			if (!this._inputProps.defaultOptions)
				this._resetValue = true;

			var options = [];

			if (this.includeEmptyValue) {
				options.push({
					value: null,
					label: ' ',
					selected: true
				});
			}

			if (items)
				for (var i = 0; i < items.length; i++) {
					var item = items[i],
						objItem = item instanceof Object ? this._addOption(item) : this._addOptionByNumber(item);
					options.push(objItem);
				}

			this._inputInstance.addOption(options);

			this._selectOptionDefault(options);
		},

		_selectOptionDefault: function(options) {

			if (this._resetValue) {
				this._resetValue = false;

				this._inputInstance.reset();
				if (this._valueInput)
					this._inputInstance.set('value', this._valueInput);
				else if (options.length)
					this._inputInstance.set('value', options[0][this._inputProps.idProperty]);
				else {
					this._inputInstance.set('value', null);
					this._setValue(null);
				}
			} else if (this._inputProps.defaultOptions) {
				this._inputInstance.set('value', lang.clone(this._inputProps.defaultOptions));
			} else  {
				if (this._inputInstance.get('value') !== this._valueInput)
					this._inputInstance.set('value', this._valueInput);
				else
					this._setValue(this._valueInput);
			}
		},

		/*_reset: function() {
			//no hace falta sobreescribirlo ahora, porque cambio el de Input
			//this._inputInstance.set(this.valuePropertyName, initValue);

			this._inputInstance.reset();

			this._setValue(this._inputInstance.get('value'));
		},*/

		_clear: function() {

			if (!this._inputInstance)
				return;

			if (this._inputProps.defaultOptions)
				this._setValue(lang.clone(this._inputProps.defaultOptions));
			else
				this._setValue(this._inputInstance.get('value'));
		},

		_addOptionByNumber: function(item) {

			var obj = {
					label: item.toString(),
					value: item
				};

			if (this._inputProps.valueIsObject)
				this._items[itemValue] = item;

			if (this._valueInput === obj.value) {
				this._resetValue = false;
				obj.selected = true;
			}

			return obj;
		},

		_addOption: function(item) {

			var itemValue = Utilities.getDeepProp(item, this._inputProps.idProperty),
				itemLabel = Utilities.getDeepProp(item, this._inputProps.labelAttr),
				itemLabelKey = item[this.labelKeyPropertyName],
				label = itemLabelKey ? Utilities.capitalize(this.i18n[itemLabelKey]) : itemLabel || itemValue,

				obj = {
					label: label,
					value: itemValue,
					selected: item.selected || false
				};

			if (this._inputProps.valueIsObject)
				this._items[itemValue] = item;

			if (this._valueInput === obj.value) {
				this._resetValue = false;
				obj.selected = true;
			}

			return obj;
		},

		_itemAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target) {
				var propertyPathSplit = this._inputProps.propertyPath.split(this.pathSeparator),
					property = res.data;

				for (var key in propertyPathSplit) {
					property = property[propertyPathSplit[key]];
				}

				this._addOptions(property);
			}
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target) {
				var data = res.data.data || res.data;

				this._addOptions(data);
			}
		},

		_actionsByValueDependence: function(res, type, action) {

			var value = res.value;

			if (action === 'addOptions') {
				var propertyPathSplit = this._inputProps.propertyPath.split(this.pathSeparator),
					property = value;

				for (var key in propertyPathSplit)
					property = property[propertyPathSplit[key]];

				this._addOptions(property);
			}
		}
	});
});
