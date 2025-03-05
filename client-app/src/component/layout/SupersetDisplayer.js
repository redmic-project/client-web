define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, 'superset-sdk'
], function(
	declare
	, lang
	, Deferred
	, _Module
	, _Show
	, _Store
	, redmicConfig
	, SupersetSdk
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Cargador de dashboards de Superset.
		//	description:
		//		Recibe una configuración de dashboard y lo integra, aplicando las restricciones de credenciales.

		constructor: function(args) {

			this.config = {
				actions: {
					CLEAR: 'clear',
					CHANGE_DASHBOARD: 'changeDashboard'
				},
				events: {
				},
				ownChannel: 'supersetDisplayer',
				target: redmicConfig.services.getSupersetToken
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (!this.dashboardConfig) {
				console.error('Missing dashboard configuration for SupersetDisplayer!');
				return;
			}

			this._prepareDashboard();
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('CHANGE_DASHBOARD'),
				callback: '_subChangeDashboard'
			},{
				channel : this.getChannel('CLEAR'),
				callback: '_subClear'
			});
		},

		_prepareDashboard: function() {

			this._prepareDashboardConfig();

			var tokenDfd = this._getGuestToken();
			tokenDfd.then(lang.hitch(this, this._prepareDashboardInstance));

			setTimeout(lang.hitch(this, function() {

				this._guestToken.resolve('123');
			}), 5000);
		},

		_prepareDashboardConfig: function() {

			if (!this.dashboardConfig.dashboardUiConfig) {
				this.dashboardConfig.dashboardUiConfig = {};
			}

			if (!this.dashboardConfig.dashboardUiConfig.urlParams) {
				this.dashboardConfig.dashboardUiConfig.urlParams = {};
			}

			this._supersetConfig = this._getDashboardConfig();
		},

		_getDashboardConfig: function() {

			this.dashboardConfig.dashboardUiConfig.urlParams = this._merge([
				this.dashboardConfig.dashboardUiConfig.urlParams, {
					activityid: this.pathVariableId
				}
			]);

			return this._merge([this.dashboardConfig, {
				mountPoint: this.getNodeToShow(),
				fetchGuestToken: lang.hitch(this, this._fetchGuestToken)
			}]);
		},

		_getGuestToken: function() {

			this._guestToken = new Deferred();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: this.dashboardConfig.id
			});

			return this._guestToken;
		},

		_prepareDashboardInstance: function() {

			this._supersetInstance = SupersetSdk.embedDashboard(this._supersetConfig);

			this._supersetInstance.then(lang.hitch(this, this._onSupersetDashboardReady));
		},

		_fetchGuestToken: function() {

			return this._guestToken;
		},

		_onSupersetDashboardReady: function() {

			console.log('dashboard ready', arguments);
		},

		_clearDashboard: function() {

			var node = this.getNodeToShow();

			node.firstChild && node.firstChild.remove();
		},

		_subChangeDashboard: function(req) {

			this.dashboardConfig = this._merge([this.dashboardConfig, req]);

			this._clearDashboard();
			this._prepareDashboard();
		},

		_subClear: function(req) {

			this._clearDashboard();
		},

		_itemAvailable: function(res) {

			var token = res.body ? res.body.token : res.token;

			this._guestToken.resolve(token);
		},

		getNodeToShow: function() {

			return this.domNode;
		}
	});
});
