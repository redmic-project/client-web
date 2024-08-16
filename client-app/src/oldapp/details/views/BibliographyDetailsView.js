define([
	"app/designs/details/main/Document"
	, 'src/redmicConfig'
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
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.bibliography;
		}
	});
});
