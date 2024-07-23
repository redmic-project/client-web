define([
	"app/designs/details/main/ServiceOGC"
	, 'src/redmicConfig'
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

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.serviceOGCEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				activities: "/admin/{rank}-info/{id}"
			};

			this.pathParent = redmicConfig.viewPaths.serviceOGC;

			this.activeTitleParent = true;
		}
	});
});
