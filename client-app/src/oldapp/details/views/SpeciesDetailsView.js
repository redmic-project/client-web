define([
	'app/designs/details/main/Species'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
], function(
	Species
	, redmicConfig
	, declare
){
	return declare(Species, {
		//	summary:
		//		Vista detalle privada de especies

		_setConfigurations: function() {

			this._titleRightButtonsList = [{
				icon: 'fa-edit',
				href: redmicConfig.viewPaths.speciesEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				documents: redmicConfig.viewPaths.documentDetails,
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.species;
		}
	});
});
