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
		//		Interfaz de Keypad.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_enableButton": {},
				"_disableButton": {},
				"_showButton": {},
				"_hideButton": {},
				"_selectButton": {},
				"_deselectButton": {},
				"_setButtonProps": {}
			});
		}
	});
});
