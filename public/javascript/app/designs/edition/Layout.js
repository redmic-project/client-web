define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Layout para vistas de edición.

		constructor: function(args) {

			lang.mixin(this, args);
		}
	});
});