define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ContactSet"
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
		//		Step de ActivityContact.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.contacts,
				title: this.i18n.contactsAssociated,

				// General params
				items: {
					contact: {
						target: redmicConfig.services.contact
					},
					role: {
						target: redmicConfig.services.contactRole
					},
					organisation: {
						target: redmicConfig.services.organisation
					}
				},
				propToRead: "contacts",

				ownChannel: "contactSetStep"
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
				modelTarget: redmicConfig.services.organisationContactRole,
				template: "administrative/views/templates/forms/ActivityContact"
			}, this.formConfig || {}]);
		}
	});
});
