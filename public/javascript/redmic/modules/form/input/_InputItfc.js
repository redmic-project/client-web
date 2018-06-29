define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Itfc"
], function(
	declare
	, lang
	, _Itfc
){
	return declare(_Itfc, {
		//	summary:
		//		Interfaz de Input.
		//	description:
		//		Define los métodos que debe poseer la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_createInputInstance": {},
				"_valueChanged": {},
				"_submit": {},
				"_updateIsValid": {},
				"_validate": {},
				"_setValue": {},
				"_shown": {},
				"_enable": {},
				"_disable": {},
				"_reset": {},
				"_clear": {},
				"_getValueToSet": {}
			});
		}
	});
});
