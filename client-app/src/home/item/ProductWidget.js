define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/ListImpl'
	, 'templates/ProductList'
], function(
	declare
	, lang
	, _Module
	, _Show
	, _Store
	, _ButtonsInRow
	, ListImpl
	, ProductListTemplate
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Widget contenedor de un listado de productos ofrecidos en la plataforma

		constructor: function(args) {

			this.config = {
				_browserTarget: 'productBrowser',
				'class': 'productPanel',
				infoTooltipClass: 'inputInfoTooltipContent',
				products: [{
					id: 1,
					name: 'speciesCatalog',
					href: 'catalog/species-catalog'
				},{
					id: 2,
					name: 'atlas',
					href: 'atlas'
				},{
					id: 3,
					name: 'ogcService',
					href: 'service-ogc-catalog'
				},{
					id: 4,
					name: 'tracking',
					href: 'viewer/tracking'
				},{
					id: 5,
					name: 'speciesDistribution',
					href: 'viewer/species-distribution'
				},{
					id: 6,
					name: 'timeSeries',
					href: 'viewer/charts'
				},{
					id: 7,
					name: 'trashCollection',
					href: 'viewer/trash-collection'
				},{
					id: 8,
					name: 'marineMonitoring',
					href: 'viewer/marine-monitoring'
				},{
					id: 9,
					name: 'bibliography',
					href: 'bibliography'
				}]
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this._browserTarget,
				template: ProductListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-arrow-right',
							btnId: 'link',
							title: 'openProduct',
							href: '/{href}'
						}]
					}
				}
			}, this.browserConfig || {}]);

			var browserDefinition = declare([ListImpl, _ButtonsInRow]);
			this.browser = new browserDefinition(this.browserConfig);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._publish(this.browser.getChannel('SHOW'), {
				node: this.domNode
			});

			this._addProducts();
		},

		_addProducts: function() {

			this._emitEvt('INJECT_DATA', {
				data: this.products,
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
		}
	});
});
