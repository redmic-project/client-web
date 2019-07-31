define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_Layout"
], function (
	declare
	, lang
	, _Layout
){
	return declare(_Layout, {
		//	summary:
		//		Layout para contenido secundario por arriba.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'topSecondaryContentLayoutDynamicDualContentDesign'
			};

			lang.mixin(this, this.config, args);
		}
	});
});
