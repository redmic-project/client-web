define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/browser/bars/Total'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/_Framework'
	, 'redmic/modules/browser/ListImpl'
	, 'templates/ActivityList'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, _Show
	, Total
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, ActivityList
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchResultsWidget',
				actions: {
					'CLEAR_DATA': 'clearData'
				},
				target: redmicConfig.services.activity,
				class: 'listZone'
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

			if (this._getPreviouslyShown()) {
				return;
			}

			this._publish(this.browser.getChannel('SHOW'), {
				node: this.domNode
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
