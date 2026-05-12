define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_ShowInTooltip'
	, 'src/component/base/_Store'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/ListImpl'
	, 'src/component/layout/dataDisplayer/DataDisplayer'
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
				ownChannel: 'statsWidget',
				events: {
					TOTAL_ACTIVITIES: 'totalActivities'
				},
				actions: {
					TOTAL_ACTIVITIES: 'totalActivities'
				},
				target: redmicConfig.services.administrativeStatistics,
				_browserTarget: 'statisticsBrowser',
				'class': 'statsPanel',
				infoTooltipClass: 'inputInfoTooltipContent'
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
							href: '/{href}'
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

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'TOTAL_ACTIVITIES',
				channel: this.getChannel('TOTAL_ACTIVITIES')
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

			let data = res.data;

			if (!data) {
				return;
			}

			const specificStatsData = [{
				attachedKey: 'activity',
				independentKey: 'activityOutProject'
			},{
				attachedKey: 'project',
				independentKey: 'projectOutProgram'
			},{
				attachedKey: 'program'
			}];

			let id = 1;

			for (let i in specificStatsData) {
				const specificStatsItem = specificStatsData[i],
					attachedKey = specificStatsItem.attachedKey,
					independentKey = specificStatsItem.independentKey,
					specificData = this._extractSpecificStats(data, attachedKey, independentKey);

				let href = `catalog/${attachedKey}-catalog`;

				if (attachedKey === 'activity') {
					this._emitEvt('TOTAL_ACTIVITIES', {
						value: specificData.total
					});
				}

				this._addStats({
					id: id,
					name: attachedKey,
					stats: specificData,
					href: href
				});

				id++;
			}

			for (let item in data) {
				let href = `catalog/${item}-catalog`;

				if (item === 'document') {
					href = 'bibliography';
				}

				this._addStats({
					id: id,
					name: item,
					stats: data[item],
					href: href
				});

				id++;
			}
		},

		_extractSpecificStats: function(data, attachedKey, independentKey) {

			var sourceStats = data[attachedKey],
				sourceIndependentStats = independentKey ? data[independentKey] : null,
				total = sourceStats.open + sourceStats.close;

			var stats = {
				total: total,
				totalOpen: sourceStats.open,
				totalClosed: sourceStats.close
			};

			if (sourceIndependentStats) {
				var independentTotal = sourceIndependentStats.open + sourceIndependentStats.close;

				stats.independentTotal = independentTotal;
				stats.independentOpen = sourceIndependentStats.open;
				stats.independentClosed = sourceIndependentStats.close;

				stats.attachedTotal = total - independentTotal;
				stats.attachedOpen = stats.totalOpen - stats.independentOpen;
				stats.attachedClosed = stats.totalClosed - stats.independentClosed;

				delete data[independentKey];
			} else {
				stats.attachedTotal = stats.total;
				stats.attachedOpen = stats.totalOpen;
				stats.attachedClosed = stats.totalClosed;
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
