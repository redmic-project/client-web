define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom-class'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/util/Credentials'
	, 'superset-sdk'
], function(
	declare
	, lang
	, domClass
	, _Module
	, _Show
	, Credentials
	, SupersetSdk
) {

	return declare([_Module, _Show], {
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

			this.inherited(arguments);

			if (!this.dashboardConfig) {
				console.error('Missing dashboard configuration for SupersetDisplayer!');
				return;
			}

			domClass.add(this.getNodeToShow(), this.className);

			this._prepareDashboard();
		},

		_prepareDashboard: function() {

			this._prepareDashboardConfig();
			this._prepareDashboardInstance();
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

			const urlParams = this._merge([this.dashboardConfig.dashboardUiConfig.urlParams, {
				activityid: this.pathVariableId
			}]);

			this.dashboardConfig.dashboardUiConfig.urlParams = urlParams;

			return this._merge([this.dashboardConfig, {
				mountPoint: this.getNodeToShow(),
				fetchGuestToken: () => Credentials.get('oidAccessToken')
			}]);
		},

		_prepareDashboardInstance: function() {

			this._supersetInstance = SupersetSdk.embedDashboard(this._supersetConfig);

			this._supersetInstance.then(lang.hitch(this, this._onSupersetDashboardReady));
		},

		_onSupersetDashboardReady: function(evt) {

			this._supersetUnmount = evt.unmount;
		},

		_clearDashboard: function() {

			this._supersetUnmount?.();
		},

		_subChangeDashboard: function(req) {

			this.dashboardConfig = this._merge([this.dashboardConfig, req]);

			this._clearDashboard();
			this._prepareDashboard();
		},

		_subClear: function(_req) {

			this._clearDashboard();
		},

		getNodeToShow: function() {

			return this.domNode;
		}
	});
});
