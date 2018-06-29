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

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.documentDetails
			},{
				title: "PDF",
				select: true,
				conditionHref: "url",
				href: redmicConfig.viewPaths.documentPDF
			}];

			this.pathParent = redmicConfig.viewPaths.document;
		}
	});
});
