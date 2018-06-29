define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Show"
	, "./_DetailsItfc"
], function(
	declare
	, lang
	, _Module
	, _Selection
	, _Show
	, _DetailsItfc
){
	return declare([_Module, _DetailsItfc, _Selection, _Show], {
		//	summary:
		//		Muestra detalles de un item
		//	description:
		//		Proporciona métodos para mostrar los detalles de un item

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				template: null,
				showBtn: {},
				selection: {},
				idProperty: "id",
				// own events
				events: {
					NEXT: "next",
					BACK: "back",
					SELECTION: "selection",
					SET_CHECK_VALUE: "setCheckValue"
				},
				// own actions
				actions: {
					UPDATE_TEMPLATE: "updateTemplate"
				},
				// mediator params
				ownChannel: "details"
			};

			lang.mixin(this, this.config, args);

			this.title = this.i18n.details;
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("UPDATE_TEMPLATE"),
				callback: "_subUpdateTemplate"
			});
		},

		_subUpdateTemplate: function(templateData) {

			this._updateTemplate(templateData);
		},

		_getItemToSelect: function(itemId) {

			return itemId;
		},

		_getItemToDeselect: function(itemId) {

			return itemId;
		}

	});
});
