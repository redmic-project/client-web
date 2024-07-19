define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "templates/RecoverySet"
], function (
	_EditionFormList
	, _RememberDeleteItems
	, Layout
	, Controller
	, redmicConfig
	, declare
	, lang
	, Deferred
	, TemplateList
){
	return declare([Layout, Controller, _EditionFormList, _RememberDeleteItems], {
		//	summary:
		//		Step de Recovery.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.recoveries,
				title: this.i18n.recoveriesAssociated,

				// General params
				items: {
					destiny: {
						target: redmicConfig.services.destiny
					},
					ending: {
						target: redmicConfig.services.ending
					}
				},
				propToRead: "recoveries",

				ownChannel: "recoverySetStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-trash",
								btnId: "remove",
								callback: "_removeItem"
							}]
						}
					}
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelTarget: redmicConfig.services.recovery,
				template: "administrative/taxonomy/views/templates/forms/Recovery"
			}, this.formConfig || {}]);
		}
	});
});
