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
		//		Interfaz de LocalSelectionView.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_localSelected": {},
				"_localDeselected": {},
				"_localClearSelection": {},
				"_localSelectionCleared": {},
				"_localSelectionSelectedAll": {},
				"_localSelect": {},
				"_localDeselect": {}
			});
		}
	});
});
