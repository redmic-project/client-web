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
		//		Interfaz de _ChartLayer.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_updateChart": {},
				"_applyAddedDataToChart": {},
				"_isDataAdded": {},
				"_isReadyToDraw": {},
				"_getData": {},
				"_getXTranslatedToScale": {},
				"_getYTranslatedToScale": {},
				"_onHorizontalScaleSet": {},
				"_onVerticalScaleSet": {},
				"_setLayerAdditionalInfo": {},
				"_getLayerAdditionalInfo": {},
				"_onIntervalChanged": {}
			});
		}
	});
});
