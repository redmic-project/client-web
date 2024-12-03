define([
	"app/designs/base/_Main"
	, "app/designs/chart/main/MultiWindRoseChartWithToolbar"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddBasicTitle"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, 'src/component/base/_ExternalConfig'
	, "src/component/chart/ChartsContainer/_AngularAxisWithGridDrawing"
	, "src/component/chart/ChartsContainer/_InfoOnEmptyData"
	, "src/component/chart/ChartsContainer/_InfoOnMouseOver"
	, "src/component/chart/ChartsContainer/_LegendBar"
	, "src/component/chart/ChartsContainer/_RadialAxisWithGridDrawing"
	, "src/component/chart/ChartsContainer/_SummaryBox"
	, "src/component/layout/templateDisplayer/TemplateDisplayer"
	, "src/component/map/layer/GeoJsonLayerImpl"
	, "src/component/map/LeafletImpl"
	, "src/component/map/_PlaceNamesButton"
	, "templates/RealTimeInfo"
	, "templates/SitePopup"
	, "templates/DefaultEmbeddedContent"
], function(
	_Main
	, MultiWindRoseChartWithToolbar
	, Controller
	, Layout
	, _AddBasicTitle
	, redmicConfig
	, declare
	, lang
	, Deferred
	, _ExternalConfig
	, _AngularAxisWithGridDrawing
	, _InfoOnEmptyData
	, _InfoOnMouseOver
	, _LegendBar
	, _RadialAxisWithGridDrawing
	, _SummaryBox
	, TemplateDisplayer
	, GeoJsonLayerImpl
	, LeafletImpl
	, _PlaceNamesButton
	, RealTimeInfo
	, SitePopupTemplate
	, EmbeddedContentTemplate
) {

	return declare([Layout, Controller, _Main, _AddBasicTitle, _ExternalConfig], {
		//	summary:
		//		Vista detalle de datos en tiempo real, dashboards.

		constructor: function(args) {

			this.config = {
				title: ' ',
				noScroll: true,

				timeSeriesStationsTarget: redmicConfig.services.timeSeriesStations,
				activityTarget: redmicConfig.services.activity,
				platformInfoTarget: 'platformInfo',
				dashboardTarget: 'realTimeDashboard',

				externalConfigPropName: 'timeSeriesDashboardSettings'
			};

			lang.mixin(this, this.config, args);

			this.target = [this.timeSeriesStationsTarget, this.activityTarget];
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		_onGotExternalConfig: function(evt) {

			var configValue = evt[this.externalConfigPropName];

			this._externalConfigDfd.resolve(configValue);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: {
					width: 2,
					height: 5,
					type: TemplateDisplayer,
					props: {
						title: 'info',
						template: RealTimeInfo,
						"class": "containerDetails",
						classEmptyTemplate: "contentListNoData",
						target: this.platformInfoTarget
					}
				},
				dashboard: {
					width: 4,
					height: 5,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.dashboard,
						template: EmbeddedContentTemplate,
						target: this.dashboardTarget
					}
				},
				windrose: {
					width: 3,
					height: 5,
					type: MultiWindRoseChartWithToolbar,
					props: {
						title: this.i18n.windrose,
						chartsContainerExts: [
							_AngularAxisWithGridDrawing,
							_RadialAxisWithGridDrawing,
							_InfoOnMouseOver,
							_LegendBar,
							_SummaryBox,
							_InfoOnEmptyData
						]
					}
				},
				location: {
					width: 3,
					height: 5,
					type: [LeafletImpl, _PlaceNamesButton],
					props: {
						title: this.i18n.location
					}
				}
			}, this.widgetConfigs || {}]);
		},

		postCreate: function() {

			this._externalConfigDfd = new Deferred();

			this.inherited(arguments);

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.timeSeriesStationsTarget,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			this._publish(this._widgets.dashboard.getChannel('CHANGE_TEMPLATE'), {
				template: EmbeddedContentTemplate
			});
		},

		_itemAvailable: function(res, resWrapper) {

			var target = resWrapper.target;

			if (target === this.timeSeriesStationsTarget) {
				this._receiveSiteData(res);
			} else if (target === this.activityTarget) {
				this._receiveActivityData(res);
			}
		},

		_receiveSiteData: function(res) {

			var itemData = res.data;

			if (!itemData || !itemData.properties) {
				return;
			}

			this._manageGeometryData(itemData);

			var siteData = itemData.properties.site;

			siteData && this._manageSiteData(siteData);

			var measurementData = itemData.properties.measurements;

			if (measurementData && this._externalConfigDfd) {
				this._externalConfigDfd.then(lang.hitch(this, this._manageMeasurementData, measurementData));
			}

			var activityId = itemData.properties.activityId;

			this._emitEvt('GET', {
				target: this.activityTarget,
				requesterId: this.getOwnChannel(),
				id: activityId
			});
		},

		_manageGeometryData: function(data) {

			if (!this.mapLayer) {
				this.mapLayer = new GeoJsonLayerImpl({
					parentChannel: this.getChannel(),
					mapChannel: this._widgets.location.getChannel(),
					onEachFeature: lang.hitch(this, this.onEachFeature)
				});

				this._publish(this._widgets.location.getChannel('ADD_LAYER'), {
					layer: this.mapLayer
				});
			} else {
				this._publish(this.mapLayer.getChannel('CLEAR'));
			}

			this._publish(this.mapLayer.getChannel('ADD_DATA'), {
				data: data
			});
			this._publish(this._widgets.location.getChannel('SET_CENTER'), {
				center: data.geometry.coordinates.reverse()
			});
		},

		onEachFeature: function(feature, layer) {

			var geoJsonData = {
				type: feature.type,
				geometry: feature.geometry,
				properties: {
					name: feature.properties.site.name,
					code: feature.properties.site.code
				}
			};

			layer.bindPopup(SitePopupTemplate({
				feature: geoJsonData,
				i18n: this.i18n
			}));
		},

		_manageSiteData: function(data) {

			this.title = data.name + ' (' + data.code + ')';
			this._updateTitle();

			this.dashboardUrl = data.dashboard;

			this._emitEvt('INJECT_ITEM', {
				data: {
					objectType: 'text/html',
					url: this.dashboardUrl,
					className: 'kibana-dashboard'
				},
				target: this.dashboardTarget
			});
		},

		_manageMeasurementData: function(data, externalConfigPropValue) {

			var dashboardSettings = externalConfigPropValue[this.pathVariableId];

			var windRosePanelConfigs = dashboardSettings.panels.filter(function(panelConfig) {

				return panelConfig.type === 'windRose';
			}, this);

			var windRosePanelConfig = windRosePanelConfigs[0],
				dataDefinitions = windRosePanelConfig.query.terms.dataDefinition,
				directionDataDefinitionIds = dataDefinitions.direction,
				speedDataDefinitionIds = dataDefinitions.speed;

			var maxTimeInterval, unitAcronym;

			for (var i = 0; i < data.length; i++) {
				var measurement = data[i],
					dataDefinition = measurement.dataDefinition,
					unit = measurement.unit;

				var dataDefinitionId = dataDefinition.id,
					timeInterval = dataDefinition.timeInterval,
					isDirectionDataDefinition = directionDataDefinitionIds.indexOf(dataDefinitionId) !== -1,
					isSpeedDataDefinition = speedDataDefinitionIds.indexOf(dataDefinitionId) !== -1;

				if (isDirectionDataDefinition || isSpeedDataDefinition) {
					if (!maxTimeInterval || timeInterval > maxTimeInterval) {
						maxTimeInterval = timeInterval;
					}
				}

				if (isSpeedDataDefinition) {
					unitAcronym = unit.acronym;
				}
			}

			this._publish(this._widgets.windrose.getChannel('SET_PROPS'), {
				directionDataDefinitionIds: directionDataDefinitionIds,
				speedDataDefinitionIds: speedDataDefinitionIds,
				timeInterval: maxTimeInterval,
				sourceUnit: unitAcronym
			});
		},

		_receiveActivityData: function(res) {

			var activityData = res.data,
				activityPlatforms = this._buildActivityPlatformsData(activityData.platforms);

			var platformData = {
				activityName: activityData.name,
				activityUrl: lang.replace(redmicConfig.viewPaths.activityDetails, {
					id: activityData.id
				}),
				description: activityData.description,
				platforms: activityPlatforms
			};

			this._manageActivityData(platformData);
			this._updateChartsDataSource(activityData.id);
		},

		_buildActivityPlatformsData: function(platforms) {

			if (platforms) {
				for (var i = 0; i < platforms.length; i++) {
					var platform = platforms[i].platform;
					platform.url = lang.replace(redmicConfig.viewPaths.platformDetails, {
						id: platform.id
					});
				}
			}

			return platforms;
		},

		_updateChartsDataSource: function(activityId) {

			var windRoseTarget = lang.replace(redmicConfig.services.timeSeriesWindRose, { id: activityId });

			this._publish(this._widgets.windrose.getChannel('SET_PROPS'), {
				target: windRoseTarget
			});
		},

		_manageActivityData: function(data) {

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.platformInfoTarget
			});
		}
	});
});
