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
		//		Interfaz de Row.
		//	description:
		//		Define los métodos que debe poseer la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {

			});
		}
	});
});
