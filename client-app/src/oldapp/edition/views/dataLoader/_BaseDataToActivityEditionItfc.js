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
		//		Interfaz de _BaseDataToActivityEdition.
		//	description:
		//		Define los métodos que debe poseer _BaseDataToActivityEdition.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_updateTitle": {},
				"_addModeConfig": {},
				"_editModeConfig": {},
				"_loadModeConfig": {}
			});
		}
	});
});
