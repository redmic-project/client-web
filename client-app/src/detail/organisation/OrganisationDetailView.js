define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/OrganisationInfo'
	, 'app/designs/details/main/_DetailsBase'
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, _DetailsBase
) {

	return declare(_DetailsBase, {
		//	summary:
		//		Vista detalle de organizaciones.


		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.organisation,
				activitiesTargetBase: redmicConfig.services.activityOrganisations,
				templateInfo: TemplateInfo,
				pathParent: redmicConfig.viewPaths.organisationCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};
		}
	});
});
