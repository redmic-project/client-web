define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "redmic/modules/form/input/_BaseMultiSelectImpl"
], function(
	declare
	, lang
	, Utilities
	, _BaseMultiSelectImpl
){
	return declare(_BaseMultiSelectImpl, {
		//	summary:
		//		Implementación de input Select.

		constructor: function(args) {

			this.config = {
				ownChannel: "multiSelect"
			};

			lang.mixin(this, this.config, args);
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			if (!this._setValueActive) {
				if (value && (!this._objValue || !Utilities.isEqual(value, this._objValue))) {
					this._clear();
					for (var i = 0; i < value.length; i++)
						this._emitEvt('SELECT_ITEM', {
							valueItem: value[i]
						});

					this._status(value);
				} else if (!value)
					this._clear();

				this._objValue = value;
			} else if (this._setValueActive && (!value || Utilities.isEqual(value, this._objValue)))
				this._setValueActive --;

			this._emitChanged(value);
		},

		_addItems: function(data) {

			if (!this.contentVisibleNode) {
				this._optionsPending = data;
				return;
			}

			for (var i= 0; i < data.length; i++) {
				var item = data[i],
					obj = {
						item: {
							label: item[this._inputProps.labelAttr],
							value: item[this._inputProps.idProperty]
						}
					};

				this._emitEvt('ADD_ITEM', obj);
			}
		},

		_subListEventItem: function(res) {

			var obj = res.selection;

			this._objValue = obj;

			this._setValueActive = 2;

			this._setValue(obj);

			this._status(obj);
		}
	});
});