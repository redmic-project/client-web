define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_Framework'
	, 'src/detail/_DetailRelatedToActivity'
	, 'templates/PlatformInfo'
], function(
	redmicConfig
	, declare
	, lang
	, _Framework
	, _DetailRelatedToActivity
	, TemplateInfo
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

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			this._contactListPrepareDetailWidget();

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				contactList: this._getContactsConfig()
			}]);
		},

		_contactListPrepareDetailWidget: function() {

			const configProps = {
				target: this.contactTarget
			};

			const contactList = this._merge([this._getContactsConfig(configProps), {
				width: 3,
				height: 4
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {contactList}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('contactList').getChannel('CLEAR'));
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target !== this.target[0]) {
				return;
			}

			this._dataToContacts(res);
		},

		_dataToContacts: function(response) {

			const contacts = response?.data?.contacts;

			if (!contacts?.length) {
				return;
			}

			this._emitEvt('INJECT_DATA', {
				data: contacts,
				target: this.contactTarget
			});
		}
	});
});
