define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/OrganisationInfo'
	, 'src/detail/_DetailRelatedToActivity'
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, _DetailRelatedToActivity
) {

	return declare(_DetailRelatedToActivity, {
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
		}
	});
});
