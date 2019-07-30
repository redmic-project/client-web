define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
) {
	return declare([_Module, _Show], {
		//	summary:
		//		Widget
		//
		// description:
		//

		// name: String
		// 	Nombre del módulo
		name: null,

		// type: String
		// Tipo del widget
		type: null,

		// icon: String
		//		Nombre del icono


		constructor: function(args){
			var options = {

			};

			lang.mixin(this, options, args);
		},

		postCreate: function() {

			this._createStructure();
		},

		_createStructure: function() {

			this.containerNode = put(this.domNode, "div.boxContainer.boxContainerBorder.mediumSolidContainer");

			this.contentNode = put(this.containerNode, "div.boxItems.fHeight");
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});
