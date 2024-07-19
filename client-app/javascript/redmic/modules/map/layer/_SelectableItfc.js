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
		//		Interfaz de _Selectable.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_getMarker": {},
				"_isMarkerSelectable": {},
				"_selectNonexistingMarker": {},
				"_deselectNonexistingMarker": {}
			});
		}
	});
});
