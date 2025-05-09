define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Filter'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Pagination'
	, 'src/component/browser/bars/Total'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/ListImpl'
	, 'templates/ActivityList'
], function(
	redmicConfig
	, declare
	, lang
	, _Filter
	, _Module
	, _Show
	, Order
	, Pagination
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
				'class': 'listZone'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				queryChannel: this.queryChannel,
				template: ActivityList,
				bars: [{
					instance: Total
				},{
					instance: Order,
					config: {
						defaultOrderField: 'starred',
						options: [
							{value: 'name'},
							{value: 'code'},
							{value: 'activityType.name', label: this.i18n.activityType},
							{value: 'startDate'},
							{value: 'endDate'},
							{value: 'updated'},
							{value: 'starred'}
						]
					}
				},{
					instance: Pagination,
					config: {
						pageSizeOptions: [10],
						rowPerPage: 10
					}
				}],
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'info',
							title: 'info',
							href: redmicConfig.viewPaths.activityDetails
						}]
					}
				}
			}, this.browserConfig || {}]);

			var BrowserDefinition = declare([ListImpl, _Framework, _ButtonsInRow, _Filter]);
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
