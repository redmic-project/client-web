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
		//		Layout para contenido secundario por la izquierda. El usuario puede cambiar el tamaño de los
		//		contenedores.

		constructor: function(args) {

			this.config = {
				secondaryContentRegion: "left",
				secondaryContentSplitter: true
			};

			lang.mixin(this, this.config, args);
		}
	});
});
