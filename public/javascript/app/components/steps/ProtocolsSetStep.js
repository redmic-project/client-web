define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, "app/maintenance/models/ProtocolsServiceOGCModel"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "templates/ProtocolsSet"
], function (
	_EditionFormList
	, _RememberDeleteItems
	, Layout
	, Controller
	, modelSchema
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
				label: this.i18n.protocols,
				title: this.i18n.protocolsAssociated,
				//idProperty: "id",

				// General params
				propToRead: "protocols",

				ownChannel: "protocolsSetStep"
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
				modelSchema: modelSchema,
				template: "maintenance/views/templates/forms/Protocols"
			}, this.formConfig || {}]);
		}
	});
});
