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
		//		Interfaz de Details.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_setImplementationCallbacksForEvents": {},
				"_showDetails": {},
				"_hideContent": {},
				"_select": {},
				"_deselect": {},
				"_updateTemplate": {}
			});
		}
	});
});
