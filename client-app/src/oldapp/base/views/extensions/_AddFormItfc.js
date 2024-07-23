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
		//		Interfaz de _AddForm.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_addFormSubscriptions": {},
				"_addFormPublications": {},
				"_formSubmitted": {},
				"_formCancelled": {},
				"_formStatus": {},
				"_afterCreateForm": {},
				"_formResetted": {},
				"_formHidden": {}
			});
		}
	});
});
