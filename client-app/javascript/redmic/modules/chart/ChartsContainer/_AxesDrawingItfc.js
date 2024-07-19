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
		//		Interfaz de _AxesDrawing.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_drawAxes": {},
				"_clearAxes": {},
				"_resizeAxes": {},
				"_removeAxisIfNotUsed": {},
				"_setNewAxesLimits": {},
				"_showAxisIfNotShown": {},
				"_hideAxisIfNotUsed": {},
				"_updateRightLimit": {},
				"_adjustHorizontalAxisToVerticalAxes": {},
				"_updateHorizontalLimitsOnLayerShown": {},
				"_updateHorizontalLimitsOnLayerHiddenOrUpdated": {}
			});
		}
	});
});
