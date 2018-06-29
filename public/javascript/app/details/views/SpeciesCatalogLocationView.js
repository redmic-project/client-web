define([
	"app/designs/details/main/SpeciesLocation"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	SpeciesLocation
	, redmicConfig
	, declare
){
	return declare(SpeciesLocation, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.speciesCatalogDetails
			},{
				title: "location",
				select: true,
				href: redmicConfig.viewPaths.speciesCatalogLocation
			}];

			this.pathParent = redmicConfig.viewPaths.speciesCatalog;
		}
	});
});