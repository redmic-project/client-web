define([
	"app/maintenance/models/AccessModel"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "templates/AccessList"
], function (
	modelSchema
	, Layout
	, Controller
	, redmicConfig
	, declare
	, lang
	, Deferred
	, TemplateList
){
	return declare([Layout, Controller], {
		//	summary:
		//		Step de Access.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.access,
				title: this.i18n.accessAssociated,

				browserExts: [],

				// General params
				items: {
					module: {
						target: redmicConfig.services.module
					}
				},
				propToRead: "accesses",

				ownChannel: "accessSetStep"
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
				modelSchema: modelSchema,
				template: "maintenance/views/templates/forms/Access"
			}, this.formConfig || {}]);
		}
	});
});
