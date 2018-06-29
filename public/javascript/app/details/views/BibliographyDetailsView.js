define([
	"app/designs/details/main/Document"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	Document
	, redmicConfig
	, declare
){
	return declare(Document, {
		//	summary:
		//		Vista detalle de Bibliography.

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityCatalogDetails
			};

			this.tabs = [{
				select: true,
				title: "seeInfo",
				href: redmicConfig.viewPaths.bibliographyDetails
			},{
				title: "PDF",
				conditionHref: "url",
				href: redmicConfig.viewPaths.bibliographyPDF
			}];

			this.pathParent = redmicConfig.viewPaths.bibliography;
		}
	});
});
