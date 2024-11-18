define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Store"
	, "./Gateway"
], function(
	declare
	, lang
	, _Store
	, Gateway
) {

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
				target = request.target;

			this._emitEvt('SELECT', {
				ids: items,
				total: 0,
				target: target
			});
		},

		_subDeselect: function(request) {

			var items = request.items,
				target = request.selectionTarget;

			this._emitEvt('DESELECT', {
				ids: items,
				total: 0,
				target: target
			});
		},

		_subClearSelection: function(request) {

			this._emitEvt('CLEAR_SELECTION', {
				target: request.selectionTarget
			});
		},

		_subSelectAll: function(request) {

			this._emitEvt('SELECT_ALL', {
				target: request.selectionTarget
			});
		}
	});
});
