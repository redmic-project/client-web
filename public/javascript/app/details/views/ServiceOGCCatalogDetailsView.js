define([
	"app/designs/details/main/ServiceOGC"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ServiceOGC
	, redmicConfig
	, declare
){
	return declare(ServiceOGC, {
		//	summary:
		//

		_setConfigurations: function() {

			this.target = redmicConfig.services.serviceOGC;

			this.viewPathsWidgets = {
				activities: "/catalog/{rank}-info/{id}"
			};

			this.activeTitleParent = true;

			this.pathParent = redmicConfig.viewPaths.serviceOGCCatalog;
		}
	});
});