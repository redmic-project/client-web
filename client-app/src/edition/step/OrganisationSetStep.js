define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/OrganisationSet"
], function (
	_EditionFormList
	, _RememberDeleteItems
	, Layout
	, Controller
	, redmicConfig
	, declare
	, lang
	, TemplateList
) {

	return declare([Layout, Controller, _EditionFormList, _RememberDeleteItems], {
		//	summary:
		//		Step de edición de organizaciones.

		constructor: function(args) {

			this.config = {
				// WizardStep params
				label: this.i18n.organisations,
				title: this.i18n.organisationsAssociated,

				// General params
				items: {
					organisation: {
						target: redmicConfig.services.organisation
					},
					role: {
						target: redmicConfig.services.organisationRole
					}
				},

				propToRead: "organisations",

				ownChannel: "organisationSetStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelTarget: redmicConfig.services.organisationrole,
				template: "administrative/views/templates/forms/ActivityOrganisation"
			}, this.formConfig || {}]);
		}
	});
});
