define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
], function(
	declare
	, Deferred
) {

	return declare(null, {
		// summary:
		//   Procesamiento de configuración para aplicar widgets adicionales a vistas detalle, en función del tipo
		//   de layout establecido para su identificador. Si no está establecido, se decide según su categoría.

		postMixInProperties: function() {

			const defaultConfig = {
				actions: {
					// credentials actions
					GET_USER_GRANTS_FOR_ENTITY: 'getUserGrantsForEntity',
					GOT_USER_GRANTS_FOR_ENTITY: 'gotUserGrantsForEntity'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_processDetailLayouts: function(entityData, layoutsConfig) {

			const currentElementId = entityData.entityId,
				detailLayouts = layoutsConfig[currentElementId];

			if (!detailLayouts?.length) {
				// retrocompatibilidad con activityCategory
				if (entityData.entityName === 'activity' && entityData.activityCategory) {
					this._prepareActivityCategoryLayoutWidgets(entityData);
				}
				return;
			}

			detailLayouts.forEach((layout) => this._processDetailLayout(entityData, layout));
		},

		_processDetailLayout: function(entityData, layout) {

			const layoutType = layout?.type;

			if (!layoutType) {
				return;
			}

			const layoutConfig = layout?.config ?? {},
				layoutCheckGrants = layout?.checkGrants ?? false;

			layoutConfig.pathVariableId = entityData.entityId;

			const processedLayout = {
				type: layoutType,
				config: layoutConfig
			}

			if (!layoutCheckGrants) {
				this._prepareLayoutWidgets(processedLayout);
				return;
			}

			const dfd = new Deferred();

			dfd.then(
				(resolvedGrants) => this._onLayoutGranted(processedLayout, resolvedGrants),
				(rejectedGrants) => this._onLayoutNotGranted(processedLayout, rejectedGrants));

			this._checkUserGrantsForEntityData(entityData, dfd);
		},

		_checkUserGrantsForEntityData: function(entityData, dfd) {

			this._once(this._buildChannel(this.credentialsChannel, 'GOT_USER_GRANTS_FOR_ENTITY'), (res) => {
				res?.accessGranted ? dfd.resolve(res) : dfd.reject(res);
			});

			this._publish(this._buildChannel(this.credentialsChannel, 'GET_USER_GRANTS_FOR_ENTITY'), entityData);
		},

		_onLayoutGranted: function(layout, resolvedGrants) {

			layout.config.accessGranted = true;

			this._prepareLayoutWidgets(layout);
		},

		_onLayoutNotGranted: function(layout, rejectedGrants) {

			// TODO mostrar al usuario un aviso de que existen datos en la actividad, pero no tiene permiso.
			// Ofrecerle identificarse.
		},

		_prepareLayoutWidgets: function(layout) {

			const prepareWidgetsMethod = `_${layout.type}PrepareLayoutWidgets`;

			this[prepareWidgetsMethod]?.(layout.config);
		},

		_prepareActivityCategoryLayoutWidgets: function(entityData) {

			const activityCategory = entityData.activityCategory;
			let layoutType;

			if (activityCategory === 'ci') {
				layoutType = 'citationMap';
			} else if (activityCategory === 'ml') {
				layoutType = 'ogcLayerMap';
			} else if (['tr', 'at', 'pt'].indexOf(activityCategory) !== -1) {
				layoutType = 'trackingMap';
			} else if (activityCategory === 'if') {
				layoutType = 'infrastructureMap';
			} else if (activityCategory === 'ar') {
				layoutType = 'areaMap';
			} else if (activityCategory === 'ft') {
				layoutType = 'featureTimeseriesMapChart';
			} else if (activityCategory === 'ec') {
				layoutType = 'embeddedContent';
			} else {
				return;
			}

			const layoutConfig = {
				pathVariableId: entityData.entityId
			};

			this._prepareLayoutWidgets({
				type: layoutType,
				config: layoutConfig
			});
		},

		_citationMapPrepareLayoutWidgets: function(layoutConfig) {

			const key = 'citationMap';

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getCitationMapConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		},

		_ogcLayerMapPrepareLayoutWidgets: function(layoutConfig) {

			const key = 'ogcLayerMap';

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getOgcLayerMapConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		},

		_trackingMapPrepareLayoutWidgets: function(layoutConfig) {

			const key = 'trackingMap';

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getTrackingMapConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		},

		_infrastructureMapPrepareLayoutWidgets: function(layoutConfig) {

			const key = 'infrastructureMap';

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getInfrastructureMapConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		},

		_areaMapPrepareLayoutWidgets: function(layoutConfig) {

			const key = 'areaMap';

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getAreaMapConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		},

		_featureMapPrepareLayoutWidgets: function(layoutConfig) {

			// configuración común

			layoutConfig.stationDataTarget = `observationStationData${layoutConfig.pathVariableId}`;

			// widget de mapa

			const mapKey = 'fixedObservationSeriesMap';

			const mapWindowConfig = {
				width: 6,
				height: 6
			};

			const mapConfig = this._merge([
				mapWindowConfig,
				this._getFixedObservationSeriesMapConfig(layoutConfig)
			]);

			this._publishLayoutWidget(mapKey, mapConfig);

			// widget de listado

			const listKey = 'fixedObservationSeriesList';

			const listWindowConfig = {
				width: 6,
				height: 6,
				hidden: true
			};

			const listConfig = this._merge([
				listWindowConfig,
				this._getFixedObservationSeriesListConfig(layoutConfig)
			]);

			this._publishLayoutWidget(listKey, listConfig);
		},

		_featureTimeseriesMapChartPrepareLayoutWidgets: function(layoutConfig) {

			// configuración común

			layoutConfig.stationDataTarget = `timeseriesStationData${layoutConfig.pathVariableId}`;

			// widget de mapa

			const mapKey = 'fixedTimeseriesMap';

			const mapWindowConfig = {
				width: 6,
				height: 6
			};

			const mapConfig = this._merge([mapWindowConfig, this._getFixedTimeseriesMapConfig(layoutConfig)]);

			this._publishLayoutWidget(mapKey, mapConfig);

			// widget de gráficas lineales

			const lineChartsKey = 'fixedTimeseriesLineCharts';

			const lineChartsWindowConfig = {
				width: 6,
				height: 5,
				hidden: true
			};

			const lineChartsConfig = this._merge([
				lineChartsWindowConfig,
				this._getFixedTimeseriesLineChartsConfig(layoutConfig)
			]);

			if (this._lineChartsWidgetKey) {
				this._destroyWidget(this._lineChartsWidgetKey);
			}
			this._lineChartsWidgetKey = lineChartsKey;

			this._publishLayoutWidget(lineChartsKey, lineChartsConfig);

			// widgets de gráfica windrose

			const windroseChartsKey = 'fixedTimeseriesWindroseCharts';

			const windroseChartsWindowConfig = {
				width: 3,
				height: 5,
				hidden: true
			};

			const windroseChartsConfig = this._merge([
				windroseChartsWindowConfig,
				this._getFixedTimeseriesWindroseChartsConfig(layoutConfig)
			]);

			if (this._windroseChartsWidgetKey) {
				this._destroyWidget(this._windroseChartsWidgetKey);
			}
			this._windroseChartsWidgetKey = windroseChartsKey;

			this._publishLayoutWidget(windroseChartsKey, windroseChartsConfig);
		},

		_embeddedContentPrepareLayoutWidgets: function(layoutConfig) {

			const key = 'embeddedContent';

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getEmbeddedContentConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		},

		_supersetDashboardPrepareLayoutWidgets: function(layoutConfig) {

			const key = `superset-${layoutConfig.dashboardConfig?.id}`;

			const windowConfig = {
				width: 6,
				height: 6
			};

			const config = this._merge([windowConfig, this._getSupersetDashboardConfig(layoutConfig)]);

			this._publishLayoutWidget(key, config);
		}
	});
});
