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
		//		Interfaz de _Show.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_getNodeToShow": {},
				"_getNodeToShowLoading": {},
				"_beforeShow": {},
				"_afterShow": {},
				"_beforeHide": {},
				"_afterHide": {},
				"_reset": {},
				"_getShownOrHiddenResponseObject": {},
				"_resize": {},
				"_getModuleRootNode": {},
				"_getModuleMainNode": {},
				"_startup": {}
			});
		}
	});
});
