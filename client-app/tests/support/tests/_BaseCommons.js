define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	declare
	, lang
	, Config
	, Utils
) {

	return declare(null, {

		constructor: function(args) {

			this.config = {
				_nameSuffix: ' tests',
				commonsProperties: {},
				userRole: userRole,
				_userRoles: {
					administrator: ' as administrator user',
					oag: ' as OAG user',
					collaborator: ' as collaborator user',
					user: ' as user',
					guest: ' as guest user'
				}
			};

			lang.mixin(this, this.config, args);

			var userRole = Config.credentials.userRole;

			this.nameSuffix = this._userRoles.administrator;

			if (userRole) {
				for (var key in this._userRoles) {
					if (key === userRole) {
						this.nameSuffix = this._userRoles[key];
						break;
					}
				}
			}

			this.nameSuffix += this._nameSuffix;
		},

		_mixPropsAndRegisterTests: function(config) {

			var specificProperties = config.properties || {},
				configClone = lang.clone(config),
				props = {
					sidebarPrimaryValue: this.sidebarPrimaryValue,
					sidebarSecondaryValue: this.sidebarSecondaryValue,
					dashboardValue: this.dashboardValue,
					urlValue: this.urlValue
				};

			lang.mixin(props, this.commonsProperties, specificProperties);

			configClone.properties = props;

			Utils.registerTests(configClone);
		}
	});
});
