define([
	"app/designs/details/main/DocumentPDF"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	DocumentPDF
	, redmicConfig
	, declare
){
	return declare(DocumentPDF, {
		//	summary:
		//		Vista detalle de Bibliography.

		_setConfigurations: function() {

			this.pathParent = redmicConfig.viewPaths.bibliography;
		}
	});
});
