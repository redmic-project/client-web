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
		//		Interfaz de _Selection.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_select": {},
				"_deselect": {},
				"_clearSelection": {},
				"_checkSelectionAfterShown": {},
				"_totalAvailable": {}
			});
		}
	});
});
