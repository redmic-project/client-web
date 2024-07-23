define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "templates/SpecimenTagSet"
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
				label: this.i18n.specimenTags,
				title: this.i18n.specimenTagsAssociated,

				// General params
				propToRead: "specimenTags",

				ownChannel: "specimenTagSetStep"
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
				modelTarget: redmicConfig.services.specimenTag,
				template: "administrative/taxonomy/views/templates/forms/SpecimenTag"
			}, this.formConfig || {}]);
		}
	});
});
