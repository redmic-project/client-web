define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_Framework'
	, 'templates/PlatformInfo'
	, 'src/detail/_DetailRelatedToActivity'
], function(
	redmicConfig
	, declare
	, lang
	, _Framework
	, TemplateInfo
	, _DetailRelatedToActivity
) {

	return declare(_DetailRelatedToActivity, {
		//	summary:
		//		Vista de detalle de plataformas.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.platform,
				activitiesTargetBase: redmicConfig.services.activityPlatforms,
				templateInfo: TemplateInfo,
				pathParent: redmicConfig.viewPaths.platformCatalog,
				contactTarget: 'contacts'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				contactList: this._getContactsConfig()
			}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('contactList').getChannel('CLEAR'));
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target === this.target[0]) {
				this._dataToContacts(res);
				return;
			}
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
