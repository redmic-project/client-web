define([
	"app/designs/doubleList/main/textSearchAndDoubleList"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/DocumentList"
], function (
	Main
	, redmicConfig
	, declare
	, lang
	, templateList
) {

	return declare(Main, {
		//	summary:
		//		Step de ActivityDocument.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.documents,
				title: this.i18n.documents,
				title2: this.i18n.documentsSelected,

				labelAttr: 'document',

				// General params
				target: redmicConfig.services.document,

				ownChannel: "documentSetStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserLeftConfig = this._merge([{
				browserConfig: {
					template: templateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								title: "info",
								href: redmicConfig.viewPaths.documentDetails
							},{
								icon: "fa-arrow-right",
								btnId: "addItem",
								classIcon: "blueIcon",
								returnItem: true
							}]
						}
					}
				}
			}, this.browserLeftConfig || {}]);

			this.browserRightConfig = this._merge([{
				browserConfig:{
					template: templateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-trash-o",
								btnId: "remove",
								callback: "_removeItem",
								classIcon: "redIcon",
								returnItem: true
							},{
								icon: "fa-info-circle",
								btnId: "details",
								title: "info",
								href: redmicConfig.viewPaths.documentDetails
							}]
						}
					}
				}
			}, this.browserRightConfig || {}]);
		}
	});
});
