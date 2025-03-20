define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ContactInfo'
	, 'templates/ContactTitle'
	, 'src/detail/_DetailRelatedToActivity'
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, TemplateTitle
	, _DetailRelatedToActivity
) {

	return declare(_DetailRelatedToActivity, {
		//	summary:
		//		Vista detalle de contactos.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.contact,
				activitiesTargetBase: redmicConfig.services.activityContacts,
				templateInfo: TemplateInfo,
				templateTitle: TemplateTitle,
				pathParent: redmicConfig.viewPaths.contactCatalog
			};

			lang.mixin(this, this.config, args);
		}
	});
});
