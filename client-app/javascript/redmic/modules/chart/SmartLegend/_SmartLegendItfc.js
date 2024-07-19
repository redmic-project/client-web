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
		//		Interfaz de SmartLegend.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_getAncestorLabel": {},
				"_getHierarchicalTemplate": {},
				"_getNonHierarchicalTemplate": {},
				"_cleanLayerPath": {},
				"_getPubToLayerObj": {},
				"_getDataToAddToBrowser": {}
			});
		}
	});
});
