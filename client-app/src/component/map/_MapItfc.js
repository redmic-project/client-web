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
		//		Interfaz de Map.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_addContainerListeners": {},
				"setView": {},
				"panTo": {},
				"setZoom": {},
				"ǵetZoom": {},
				"invalidateSize": {},
				"hasLayer": {},
				"addLayer": {},
				"removeLayer": {},
				"bringLayerToFront": {},
				"bringLayerToBack": {},
				"getBounds": {},
				"getCenter": {},
				"_getMapInstance": {},
				"addButton": {},
				"_addQueryableCursor": {},
				"_removeQueryableCursor": {},
				"_prepareInfoForLayerAddedEvent": {}
			});
		}
	});
});
