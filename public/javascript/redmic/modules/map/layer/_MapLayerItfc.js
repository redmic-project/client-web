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
		//		Interfaz de MapLayer.
		//	description:
		//		Define los métodos que debe poseer la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_addBoundsToQuery": {},
				"addData": {},
				"_addNewData": {},
				"setStyle": {},
				"clear": {},
				"_selectMarker": {},
				"_deselectMarker": {},
				"_getLayerLegend": {},
				"_afterLayerAdded": {},
				"_afterLayerRemoved": {},
				"_redraw": {},
				"_animateMarker": {},
				"_setCenter": {}
			});
		}
	});
});
