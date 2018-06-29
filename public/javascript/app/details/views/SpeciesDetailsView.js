define([
	"app/designs/details/main/Species"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	Species
	, redmicConfig
	, declare
){
	return declare(Species, {
		//	summary:
		//

		_setConfigurations: function() {

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.speciesEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				documents: redmicConfig.viewPaths.documentDetails,
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.tabs = [{
				select: true,
				title: "seeInfo",
				href: redmicConfig.viewPaths.speciesDetails
			},{
				title: "location",
				href: redmicConfig.viewPaths.speciesLocation
			}];

			this.pathParent = redmicConfig.viewPaths.species;
		}
	});
});