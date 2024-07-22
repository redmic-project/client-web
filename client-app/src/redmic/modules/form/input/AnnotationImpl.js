define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/form/input/Input"
], function(
	declare
	, lang
	, put
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input Annotation.

		constructor: function(args) {

			this.config = {
				ownChannel: "annotation"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputNodes: function() {

			this._disableInputActive = false;
			this.inherited(arguments);
		},

		_createInputInstance: function() {

			put(this.containerInput, "div.annotation", this._inputProps.content);

			return false;
		},

		_valueChanged: function(obj) {

		},

		_shown: function() {

		},

		subGotPropertyInstance: function(request) {

		}
	});
});