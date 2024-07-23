define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	,"app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, 'templates/ThematicTypeSet'
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
		//		Step de ActivityContact.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.classifications,
				title: this.i18n.classificationsAssociated,

				// General params
				items: {
					type: {
						target: redmicConfig.services.thematicType
					}
				},
				propToRead: "areaClassification",

				ownChannel: "areaClassificationsSetStep"
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
				modelTarget: redmicConfig.services.areaClassifications,
				template: "dataLoader/areas/views/templates/AreaClassifications"
			}, this.formConfig || {}]);
		}
	});
});
