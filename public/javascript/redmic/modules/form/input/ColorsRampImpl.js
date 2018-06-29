define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/form/input/_BaseMultiSelectImpl"
	, "templates/FilterColorRamp"
	, 'colorjs/color'
], function(
	declare
	, lang
	, aspect
	, put
	, _BaseMultiSelectImpl
	, templateFilterColorRamp
){
	return declare(_BaseMultiSelectImpl, {
		//	summary:
		//		Implementación de input FilteringSelect.

		constructor: function(args) {

			this.config = {
				colorjs: net.brehaut.Color,
				ownChannel: "colorRamp",

				optionsDefault: [],
				numberOfColors: 5,
				_optionsColors: []
			};

			lang.mixin(this, this.config, args);
			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setColorRampConfigurations));
		},

		_setColorRampConfigurations: function() {

			this.optionConfig = this._merge([this.optionConfig || {}, {
				multipleSelected: false,
				timeClose: 500,
				select: {
					'default': null
				}
			}]);
		},

		_createInputContent: function() {

			put(this.containerInput, '.colorRampSelect');

			this._generateOptionsDefaultColor();

			this.contentTemplateNode = put(this.contentVisibleNode, 'div.value');
			//put(this.contentVisibleNode, 'i.fa.fa-angle-down');
		},

		_generateOptionsDefaultColor: function() {

			var arrayColors = this.colorjs("#288DC0").sixToneCCWScheme();

			for (var i = 0; i < arrayColors.length; i++)
				this.optionsDefault.push(arrayColors[i].toCSSHex());
		},

		_requestOptionsColors: function(/*Object*/ res) {

			this._inputInstance.emit('receivedResults', {
				data: this._optionsColors,
				total: this._optionsColors.length
			});
		},

		_setValue: function(value) {

			var obj = {},
				colors = this._optionsColors &&this._optionsColors[value] && this._optionsColors[value].colors;

			obj[this.propertyName] = colors;

			this._emitSetValue(obj);
		},

		_generateOptionsColors: function() {

			var option;

			this._optionsColors = [];

			for (var i = 0; i < this.optionsDefault.length; i++) {
				option = this._generateOptionColor(this.optionsDefault[i]);
				option.value = (this._optionsColors.length + 1).toString();

				this._optionsColors.push(option);
			}
		},

		_generateOptionColor: function(color) {

			var colors = [],
				index;

			for (var i = 1; i <= this.numberOfColors; i++) {
				index = (0.5 / this.numberOfColors) * i;
				colors.push(this._generateNewColor(color, index));
			}

			return {
				colors: colors
			};
		},

		_generateNewColor: function(originalColor, index) {

			var color = this.colorjs(originalColor);

			return color.darkenByRatio(index).toCSS();
		},

		_actionsByValueDependence: function(res, type, action) {

			var value = res.value;

			if (action === 'addOptions' || value) {

				this.numberOfColors = value;

				this._generateOptionsColors();

				this._addItems(this._optionsColors);
			}
		},

		_valueChanged: function(res) {

			//console.log(res);

			var value = res.value || res[this.propertyName];

			this.contentTemplateNode.innerHTML = templateFilterColorRamp({
				colors: value
			});

			this._emitChanged(value);
		},

		_addItems: function(data) {

			if (!this.contentVisibleNode) {
				this._optionsPending = data;
				return;
			}

			var items = [];

			for (var i= 0; i < data.length; i++) {
				var item = data[i],
					obj = {
						data: item,
						value: i,
						template: templateFilterColorRamp
					};

				items.push(obj);
			}

			this.contentTemplateNode.innerHTML = '';

			this._emitEvt('CHANGE_ITEMS', {
				items: items
			});

			this._itemSelect(0);

			this._emitEvt('SELECT_ITEM', {
				valueItem: this._valueColor
			});
		},

		_subListEventItem: function(res) {

			this._itemSelect(res.value);
		},

		_itemSelect: function(value) {

			this._valueColor = value;

			this._setValue(value);
		}
	});
});