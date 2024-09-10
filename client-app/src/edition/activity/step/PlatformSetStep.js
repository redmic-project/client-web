define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/PlatformSet"
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
		//		Step de ActivityPlatform.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.platforms,
				title: this.i18n.platformsAssociated,

				// General params
				items: {
					platform: {
						target: redmicConfig.services.platform
					},
					contact: {
						target: redmicConfig.services.contact
					},
					role: {
						target: redmicConfig.services.contactRole
					}
				},
				propToRead: "platforms",

				ownChannel: "platformSetStep"
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
				modelTarget: redmicConfig.services.platformContactRole,
				template: "administrative/views/templates/forms/ActivityPlatform"
			}, this.formConfig || {}]);
		}
	});
});
