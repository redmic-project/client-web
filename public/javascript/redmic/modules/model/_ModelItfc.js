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
		//		Interfaz de Model.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_onModelBuilt": {},
				"_setPropertyValue": {},
				"_getPropertyValue": {},
				"_deserialize": {},
				"_serialize": {},
				"_reset": {},
				"_clear": {},
				"_getIsValidStatus": {},
				"_getPropertyIsValidStatus": {},
				"_getHasChangedStatus": {},
				"_getPropertyInstance": {},
				"_getIdPropertyValue": {},
				"_addValue": {},
				"_deleteValue": {}
			});
		}
	});
});
