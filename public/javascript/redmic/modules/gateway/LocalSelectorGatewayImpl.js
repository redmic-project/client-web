define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "./Gateway"
], function(
	declare
	, lang
	, _Store
	, Gateway
){
	return declare([Gateway, _Store], {
		//	summary:
		//		Implementación de gateway para trabajar con selecciones locales.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				ownChannel: "localSelectorGateway"
			};

			lang.mixin(this, this.config, args);
		},

		_subSelect: function(request) {

			var items = request.items,
				target = request.selectionTarget;

			this._emitEvt('SELECT', {
				success: true,
				body: {
					ids: items,
					total: 0,
					selectionTarget: target
				}
			});
		},

		_subDeselect: function(request) {

			var items = request.items,
				target = request.selectionTarget;

			this._emitEvt('DESELECT', {
				success: true,
				body: {
					ids: items,
					total: 0,
					selectionTarget: target
				}
			});
		},

		_subClearSelection: function(request) {

			this._emitEvt('CLEAR_SELECTION', {
				success: true,
				body: {
					selectionTarget: request.selectionTarget
				}
			});
		},

		_subSelectAll: function(request) {

			this._emitEvt('SELECT_ALL', {
				success: true,
				body: {
					selectionTarget: request.selectionTarget
				}
			});
		}
	});
});