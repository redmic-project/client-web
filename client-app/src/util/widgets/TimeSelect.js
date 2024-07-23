define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, 'moment/moment.min'
	, "put-selector/put"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, moment
	, put
) {
	return declare([_WidgetBase, Evented], {
		//	summary:
		//		Widget
		//
		// description:
		//

		"class": "timeInput",

		constructor: function(args) {

			this.config = {
				events: {

				},
				units: ['hour', 'minute', 'second'],
				initValue: null
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			for(var i = 0; i < this.units.length; i++) {
				this._createUnitTime(this.units[i]);
				if (i + 1 !== this.units.length)
					this._createUnitSeparator();
			}
		},

		_createUnitTime: function(name) {

			this[name + 'Node'] = put(this.domNode, 'div.unitContent');

			this[name + 'IncrementNode'] = put(this[name + 'Node'], 'i.fa.fa-chevron-up');
			this[name + 'IncrementNode'].onclick = lang.hitch(this, this._incrementOnclick, name);

			this[name + 'SpanNode'] = put(this[name + 'Node'], 'span', '00');

			this[name + 'DecrementNode'] = put(this[name + 'Node'], 'i.fa.fa-chevron-down');
			this[name + 'DecrementNode'].onclick = lang.hitch(this, this._decrementOnclick, name);
		},

		_createUnitSeparator: function() {

			put(this.domNode, 'div.unitSeparator', ':');
		},

		_incrementOnclick: function(name) {

			if (this._disable)
				return;

			var value = this._getUnitValue(name) + 1;

			if ((value === 24 && name === 'hour') || (value === 60))
					value = 0;

			this._value.set(name, value);
			this._setUnitValue(name, value);

			this.onChange(this._value.format());
		},

		_decrementOnclick: function(name) {

			if (this._disable)
				return;

			var value = this._getUnitValue(name) - 1;

			if (value === -1) {
				if (name === 'hour')
					value = 23;
				else
					value = 59;
			}

			this._value.set(name, value);
			this._setUnitValue(name, value);

			this.onChange(this._value.format());
		},

		_getUnitValue: function(name) {

			return parseInt(this[name + 'SpanNode'].innerText, 10);
		},

		_setUnitValue: function(name, value) {

			this[name + 'SpanNode'].innerText = ('0' + value).slice(-2);
		},

		setValue: function(value) {

			if (!value)
				return this.clear();

			if ((this._value && this._value.toDate() === value))
				return;

			this._value = moment(value);

			for(var i = 0; i < this.units.length; i++) {
				var name = this.units[i];
				this._setUnitValue(name, this._value[name]());
			}
		},

		clear: function() {

			if (this.initValue)
				return this.setValue(this.initValue);

			this._value = null;

			for(var i = 0; i < this.units.length; i++) {
				var name = this.units[i];
				this._setUnitValue(name, 0);
			}
		},

		disable: function(value) {

			if (this._disable)
				return;

			this._disable = true;

			put(this.domNode, ".disable");
		},

		enable: function(value) {

			if (!this._disable)
				return;

			this._disable = false;

			put(this.domNode, "!disable");
		}
	});
});