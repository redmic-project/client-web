define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ContactInfo'
	, 'templates/ContactTitle'
	, 'app/designs/details/main/_DetailsBase'
], function(
	redmicConfig
	, declare
	, lang
	, TemplateInfo
	, TemplateTitle
	, _DetailsBase
) {

	return declare(_DetailsBase, {
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
		},

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};
		}
	});
});
