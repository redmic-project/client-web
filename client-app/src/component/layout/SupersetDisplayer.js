define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/dom-class'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, 'superset-sdk'
], function(
	declare
	, lang
	, Deferred
	, domClass
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
				target: redmicConfig.services.getSupersetToken,
				className: 'supersetDashboard'
			};

			lang.mixin(this, this.config, args);
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

		postCreate: function() {

			if (!this.dashboardConfig) {
				console.error('Missing dashboard configuration for SupersetDisplayer!');
				return;
			}

			domClass.add(this.getNodeToShow(), this.className);

			this._prepareDashboard();
		},

		_prepareDashboard: function() {

			this._prepareDashboardConfig();

			var tokenDfd = this._getGuestToken();
			tokenDfd.then(lang.hitch(this, this._prepareDashboardInstance));
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

		_onSupersetDashboardReady: function(evt) {

			this._supersetUnmount = evt.unmount;
		},

		_clearDashboard: function() {

			if (this._supersetUnmount) {
				this._supersetUnmount();
			}
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

			var data = res && res.data || {},
				token = data.token;

			if (token) {
				this._guestToken.resolve(token);
			} else {
				this._guestToken.reject('No token available');
			}
		},

		getNodeToShow: function() {

			return this.domNode;
		}
	});
});
