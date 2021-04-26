define([
	'app/home/views/_DashboardItem'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/browser/bars/Total'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/_Framework'
	, 'redmic/modules/browser/ListImpl'
	, 'templates/ActivityList'
], function(
	_DashboardItem
	, redmicConfig
	, declare
	, lang
	, put
	, _Store
	, Total
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, ActivityList
) {

	return declare([_DashboardItem, _Store], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchResultsWidget',
				actions: {
					'CLEAR_DATA': 'clearData'
				},
				target: redmicConfig.services.activity,
				className: 'listZone'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				template: ActivityList,
				bars: [{
					instance: Total
				}],
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'info',
							title: 'info',
							href: redmicConfig.viewPaths.activityCatalogDetails
						}]
					}
				}
			}, this.browserConfig || {}]);

			var BrowserDefinition = declare([ListImpl, _Framework, _ButtonsInRow]);
			this.browser = new BrowserDefinition(this.browserConfig);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('CLEAR_DATA'),
				callback: '_subClearData'
			});
		},

		_afterShow: function() {

			if (!this._getPreviouslyShown()) {
				// TODO retocar contenedores de por encima, igual no extender de la base de ahora
				put(this.containerNode, '.flex');
				this._browserNode = put(this.containerNode, 'div.' + this.className);
			}

			this._publish(this.browser.getChannel("SHOW"), {
				node: this._browserNode
			});
		},

		_onTargetPropSet: function(evt) {

			this._setPropToChildModules(evt.prop, evt.value);
		},

		_onQueryChannelPropSet: function(evt) {

			this._setPropToChildModules(evt.prop, evt.value);
		},

		_setPropToChildModules: function(prop, value) {

			var obj = {};
			obj[prop] = value;

			this._publish(this.browser.getChannel('SET_PROPS'), obj);
		},

		_subClearData: function(req) {

			this._publish(this.browser.getChannel("CLEAR"));
		}
	});
});
