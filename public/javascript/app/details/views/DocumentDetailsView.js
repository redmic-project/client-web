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
		//		Vista detalle de Document.

		_setConfigurations: function() {

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.documentEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.tabs = [{
				select: true,
				title: "seeInfo",
				href: redmicConfig.viewPaths.documentDetails
			},{
				title: "PDF",
				conditionHref: "url",
				href: redmicConfig.viewPaths.documentPDF
			}];

			this.shownOptionInfo = {
				remark: true
			};

			this.pathParent = redmicConfig.viewPaths.document;
		}
	});
});