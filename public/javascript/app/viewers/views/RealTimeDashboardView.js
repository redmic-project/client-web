define([
	"app/designs/base/_Main"
	, "app/designs/chart/main/MultiWindRoseChartWithToolbar"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddBasicTitle"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/chart/ChartsContainer/_AngularAxisWithGridDrawing"
	, "redmic/modules/chart/ChartsContainer/_InfoOnMouseOver"
	, "redmic/modules/chart/ChartsContainer/_LegendBar"
	, "redmic/modules/chart/ChartsContainer/_RadialAxisWithGridDrawing"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
	, "redmic/modules/map/_PlaceNamesButton"
	, "templates/RealTimeInfo"
	, "templates/SitePopup"
	, "templates/SurveyStationDashboard"
], function(
	_Main
	, MultiWindRoseChartWithToolbar
	, Controller
	, Layout
	, _AddBasicTitle
	, redmicConfig
	, declare
	, lang
	, _AngularAxisWithGridDrawing
	, _InfoOnMouseOver
	, _LegendBar
	, _RadialAxisWithGridDrawing
	, TemplateDisplayer
	, GeoJsonLayerImpl
	, LeafletImpl
	, Map
	, _PlaceNamesButton
	, RealTimeInfo
	, SitePopupTemplate
	, SurveyStationDashboardTemplate
){
	return declare([Layout, Controller, _Main, _AddBasicTitle], {
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

				// TODO esta información provendrá de un servicio en el futuro, siguiendo este formato
				_timeSeriesDashboardSettings: {
					'839c02ed-dc2c-4b5e-9100-8c9d88542152': {
						panels: [{
							type: 'windRose',
							query: {
								terms: {
									dataDefinition: {
										direction: [19],
										speed: [20]
									}
								}
							}
						}]
					},
					'27bad38e-ee75-4fdc-82c9-dfe3d421e677': {
						panels: [{
							type: 'windRose',
							query: {
								terms: {
									dataDefinition: {
										direction: [15],
										speed: [18]
									}
								}
							}
						}]
					}
				}
			};

			lang.mixin(this, this.config, args);

			this.target = [this.timeSeriesStationsTarget, this.activityTarget];
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: {
					width: 2,
					height: 5,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.info,
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
						template: SurveyStationDashboardTemplate,
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
							_LegendBar
						]
					}
				},
				location: {
					width: 3,
					height: 5,
					type: [LeafletImpl, Map, _PlaceNamesButton],
					props: {
						title: this.i18n.location
					}
				}
			}, this.widgetConfigs || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);
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
				template: SurveyStationDashboardTemplate
			});
		},

		_itemAvailable: function(res) {

			if (res.target === this.timeSeriesStationsTarget) {
				this._receiveSiteData(res);
			} else if (res.target === this.activityTarget) {
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

			measurementData && this._manageMeasurementData(measurementData);

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
					url: this.dashboardUrl
				},
				target: this.dashboardTarget
			});
		},

		_manageMeasurementData: function(data) {

			var dashboardSettings = this._timeSeriesDashboardSettings[this.pathVariableId];

			var windRosePanelConfigs = dashboardSettings.panels.filter(function(panelConfig) {

				return panelConfig.type === 'windRose';
			}, this);

			var windRosePanelConfig = windRosePanelConfigs[0],
				dataDefinitions = windRosePanelConfig.query.terms.dataDefinition,
				directionDataDefinitionIds = dataDefinitions.direction,
				speedDataDefinitionIds = dataDefinitions.speed;

			var maxTimeInterval;

			for (var i = 0; i < data.length; i++) {
				var measurement = data[i],
					dataDefinitionId = measurement.dataDefinition.id,
					timeInterval = measurement.dataDefinition.timeInterval,
					isDirectionDataDefinition = directionDataDefinitionIds.indexOf(dataDefinitionId) !== -1,
					isSpeedDataDefinition = speedDataDefinitionIds.indexOf(dataDefinitionId) !== -1;

				if (isDirectionDataDefinition || isSpeedDataDefinition) {
					if (!maxTimeInterval || timeInterval > maxTimeInterval) {
						maxTimeInterval = timeInterval;
					}
				}
			}

			this._publish(this._widgets.windrose.getChannel('SET_PROPS'), {
				directionDataDefinitionIds: directionDataDefinitionIds,
				speedDataDefinitionIds: speedDataDefinitionIds,
				timeInterval: maxTimeInterval
			});
		},

		_receiveActivityData: function(res) {

			var activityData = res.data,
				activityPlatformData = activityData.platforms[0].platform,
				platformData = {
					activityName: activityData.name,
					activityUrl: lang.replace(redmicConfig.viewPaths.activityCatalogDetails, {
						id: activityData.id
					}),
					platformName: activityPlatformData.name,
					platformUrl: lang.replace(redmicConfig.viewPaths.platformCatalogDetails, {
						id: activityPlatformData.id
					}),
					description: activityData.description,
					image: activityPlatformData.image
				};

			this._manageActivityData(platformData);

			this._updateChartsDataSource(activityData.id);
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
