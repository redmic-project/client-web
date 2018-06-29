define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Total"
	, "templates/ContactSet"
	, "templates/PlatformInfo"
	, "./_DetailsBase"
], function(
	redmicConfig
	, declare
	, lang
	, _Framework
	, ListImpl
	, Total
	, TemplateContacts
	, TemplateInfo
	, _DetailsBase
){
	return declare([_DetailsBase], {
		//	summary:
		//		Vista detalle de Organisation.


		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.platform,
				activitiesTargetBase: redmicConfig.services.activityPlatforms,
				templateInfo: TemplateInfo,
				contactTarget: "contacts"
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				additionalInfo: {
					props: {
						childTabs: [
							this._configAdditionalInfoActivity(),
							{
								title: this.i18n.contacts,
								type: declare([ListImpl, _Framework]),
								props: {
									target: this.contactTarget,
									template: TemplateContacts,
									bars: [{
										instance: Total
									}]
								}
							}
						]
					}
				}
			}, this.widgetConfigs || {}]);

			this.inherited(arguments);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.1", "CLEAR"));
		},

		_itemAvailable: function(response) {

			if (response.target === this.target[0]) {
				this._dataToContacts(response);
				return;
			}

			this.inherited(arguments);
		},

		_dataToContacts: function(response) {

			var data = response.data,
				contacts = data.contacts;

			if (contacts && contacts.length) {
				this._emitEvt('INJECT_DATA', {
					data: contacts,
					target: this.contactTarget
				});
			}
		}
	});
});
