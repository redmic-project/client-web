define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/form/input/Input"
	, "RWidgets/KeywordsInput"
], function(
	declare
	, lang
	, Input
	, KeywordsInput
){
	return declare(Input, {
		//	summary:
		//		Implementación de input Keywords.

		constructor: function(args) {

			this.config = {
				propertyName: "name",
				ownChannel: "keywords"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			var widget = new KeywordsInput(this._inputProps).placeAt(this.containerInput);

			return widget;
		},

		_valueChanged: function(obj) {

			this._inputInstance.emit('setValue', obj[this.propertyName]);
			this._emitChanged(obj[this.propertyName]);
		},

		_reset: function() {

			this._inputInstance.emit('reset');
			this._enable();
		},

		_clear: function() {

			this._inputInstance.emit('clear');
			this._enable();
		}
	});
});
