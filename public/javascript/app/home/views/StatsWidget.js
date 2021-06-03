define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/ListImpl'
	, 'redmic/modules/layout/dataDisplayer/DataDisplayer'
	, 'templates/StatisticsList'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, _Show
	, _ShowInTooltip
	, _Store
	, _ButtonsInRow
	, ListImpl
	, DataDisplayer
	, StatisticsListTemplate
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Widget contenedor de estadísticas públicas de la plataforma

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.administrativeStatistics,
				_browserTarget: 'browserStatistics',
				'class': 'statsPanel',
				infoTooltipClass: 'inputInfoTooltipContent',
				_titleRightButtonsList: []
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this._browserTarget,
				template: StatisticsListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'info',
							title: 'infoButtonTitle',
							returnItem: true,
							node: true
						},{
							icon: 'fa-arrow-right',
							btnId: 'details',
							title: 'catalog',
							href: '/catalog/{href}-catalog'
						}]
					}
				}
			}, this.browserConfig || {}]);

			var browserDefinition = declare([ListImpl, _ButtonsInRow]);
			this.browser = new browserDefinition(this.browserConfig);

			this._infoDefinition = declare(DataDisplayer).extend(_ShowInTooltip);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.browser.getChannel('BUTTON_EVENT'),
				callback: '_subBrowserButtonEvent'
			});
		},

		_subBrowserButtonEvent: function(res) {

			this._showStatsInfo(res.item, res.iconNode);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._publish(this.browser.getChannel('SHOW'), {
				node: this.domNode
			});

			this._emitEvt('REQUEST', this._getRequestObj());
		},

		_getRequestObj: function() {

			return {
				target: this.target,
				method: 'GET',
				type: 'API',
				requesterId: this.getOwnChannel()
			};
		},

		_addStats: function(data) {

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this._browserTarget
			});
		},

		_dataAvailable: function(res) {

			var data = res.data;

			if (!data) {
				return;
			}

			var specificStatsData = [{
				attachedKey: 'activity',
				independentKey: 'activityOutProject'
			},{
				attachedKey: 'project',
				independentKey: 'projectOutProgram'
			},{
				attachedKey: 'program'
			}];

			var id = 1;

			for (var i in specificStatsData) {
				var specificStatsItem = specificStatsData[i],
					attachedKey = specificStatsItem.attachedKey,
					independentKey = specificStatsItem.independentKey,
					specificData = this._extractSpecificStats(data, attachedKey, independentKey);

				this._addStats({
					id: id,
					name: attachedKey,
					stats: specificData,
					href: attachedKey === 'activity' ? 'activities': attachedKey // TODO ruta incorrecta de vista
				});

				id++;
			}

			for (var item in data) {
				this._addStats({
					id: id,
					name: item,
					stats: data[item],
					href: item
				});

				id++;
			}
		},

		_extractSpecificStats: function(data, attachedKey, independentKey) {

			var sourceStats = data[attachedKey],
				sourceIndependentStats = independentKey ? data[independentKey] : null,
				attachedTotal = sourceStats.open + sourceStats.close;

			var stats = {
				attachedTotal: attachedTotal,
				attachedOpen: sourceStats.open,
				attachedClosed: sourceStats.close
			};

			if (independentKey) {
				var independentTotal = sourceIndependentStats.open + sourceIndependentStats.close;

				stats.independentTotal = independentTotal;
				stats.independentOpen = sourceIndependentStats.open;
				stats.independentClosed = sourceIndependentStats.close;

				stats.total = attachedTotal + independentTotal;
				stats.totalOpen = sourceStats.open + sourceIndependentStats.open;
				stats.totalClosed = sourceStats.close + sourceIndependentStats.close;

				delete data[independentKey];
			} else {
				stats.total = attachedTotal;
				stats.totalOpen = sourceStats.open;
				stats.totalClosed = sourceStats.close;
			}

			delete data[attachedKey];

			return stats;
		},

		_showStatsInfo: function(item, sourceNode) {

			if (!item) {
				return;
			}

			var info = item.name;

			if (!info || !info.length) {
				return;
			}

			var infoKey = info + 'MoreInfo',
				infoValue = this.i18n[infoKey] || infoKey;

			this._infoInstance = new this._infoDefinition({
				parentChannel: this.getChannel(),
				data: infoValue,
				'class': this.infoTooltipClass
			});

			this._publish(this._infoInstance.getChannel('SHOW'), {
				node: sourceNode
			});
		}
	});
});
