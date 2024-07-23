define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Itfc"
], function(
	declare
	, lang
	, _Itfc
){
	return declare(_Itfc, {
		//	summary:
		//		Interfaz de Form.
		//	description:
		//		Define los métodos que debe poseer la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_render": {},
				"_submit": {},
				"_cancel": {},
				"_shown": {},
				"_reset": {},
				"_clear": {},
				"_disconnect": {},
				"_ancestorResized": {},
				"_setData": {},
				"_serialize": {},
				"_enableProperty": {},
				"_disableProperty": {},
				"_setPropertyValue": {},
				"_setMethod": {},
				"_validationErrorsChanged": {},
				"_wasValid": {},
				"valueChanged": {}
			});
		}
	});
});
