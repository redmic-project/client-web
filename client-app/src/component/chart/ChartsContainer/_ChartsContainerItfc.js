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
		//		Interfaz de ChartsContainer.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_getLayerInfo": {},
				"_getHorizontalScale": {},
				"_getVerticalScale": {},
				"_setHorizontalAxisLimits": {},
				"_showHorizontalGridAxis": {},
				"_showVerticalGridAxis": {},
				"_hideHorizontalGridAxis": {},
				"_hideVerticalGridAxis": {},
				"_prepareUpdateLayersPromises": {},
				"_finishUpdateLayersPromises": {},
				"_updateOriginalDomain": {},
				"_recordDomain": {}
			});
		}
	});
});
