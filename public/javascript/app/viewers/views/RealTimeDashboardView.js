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
	, "redmic/modules/chart/ChartsContainer/_InfoOnEmptyData"
	, "redmic/modules/chart/ChartsContainer/_InfoOnMouseOver"
	, "redmic/modules/chart/ChartsContainer/_LegendBar"
	, "redmic/modules/chart/ChartsContainer/_RadialAxisWithGridDrawing"
	, "redmic/modules/chart/ChartsContainer/_SummaryBox"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/LeafletImpl"
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
					},
					"0c6fc82e-cb39-4668-b732-047b14ecdfc0": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												845
											],
											"speed": [
												844
											]
										}
									}
								}
							}
						]
					},
					"2d2b3b42-3223-4290-804c-cbffab6e9689": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												758
											],
											"speed": [
												757
											]
										}
									}
								}
							}
						]
					},
					"bbb1e80c-11f8-4dea-be8a-81fa190f4ec0": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												956
											],
											"speed": [
												955
											]
										}
									}
								}
							}
						]
					},
					"ab233bc3-bdb1-4396-a8d5-1b50915d42ab": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												836
											],
											"speed": [
												835
											]
										}
									}
								}
							}
						]
					},
					"7f9945f7-5691-4307-9b34-bdc39abadb6f": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												889
											],
											"speed": [
												890
											]
										}
									}
								}
							}
						]
					},
					"8adce85f-00c8-464a-b5e5-1baf1082dea0": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												912
											],
											"speed": [
												911
											]
										}
									}
								}
							}
						]
					},
					"63bb4ef8-8066-40b8-badb-9d596a3733d7": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												921
											],
											"speed": [
												920
											]
										}
									}
								}
							}
						]
					},
					"1fba2156-74e9-4fe4-a7a6-d9c346ab63ba": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												946
											],
											"speed": [
												947
											]
										}
									}
								}
							}
						]
					},
					"3b9faf21-826c-449a-aa21-d3f1030f847e": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												775
											],
											"speed": [
												776
											]
										}
									}
								}
							}
						]
					},
					"4451fe86-9b43-4df8-b2f9-88f8688a4072": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												753
											],
											"speed": [
												752
											]
										}
									}
								}
							}
						]
					},
					"146c5133-1e36-4088-8daf-7ebdc9d3d0c1": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												747
											],
											"speed": [
												746
											]
										}
									}
								}
							}
						]
					},
					"b4181ed9-f90f-454b-8d5e-e59481f645ea": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [],
											"speed": []
										}
									}
								}
							}
						]
					},
					"2a1d5746-e7c0-4847-afb1-37dfa106c5a9": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												764
											],
											"speed": [
												763
											]
										}
									}
								}
							}
						]
					},
					"d4ec21c5-a80d-48f3-9152-43cbc277217a": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												1043
											],
											"speed": [
												1042
											]
										}
									}
								}
							}
						]
					},
					"bbfa1aec-3c16-4bbb-8621-b1675bc2d1c1": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												770
											],
											"speed": [
												769
											]
										}
									}
								}
							}
						]
					},
					"c6539063-30ab-4aa1-8eff-f7f065da7232": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												899
											],
											"speed": [
												898
											]
										}
									}
								}
							}
						]
					},
					"17e04f7b-8295-4095-9488-d2b61408c0ae": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												1021
											],
											"speed": [
												1020
											]
										}
									}
								}
							}
						]
					},
					"2383c489-41e4-4037-bb45-d49fe4aebae2": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												1010
											],
											"speed": [
												1009
											]
										}
									}
								}
							}
						]
					},
					"8b9ffedc-a511-4e59-bf45-3dc5e2963832": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												967
											],
											"speed": [
												966
											]
										}
									}
								}
							}
						]
					},
					"72a17192-3a03-4564-ac2d-e163f81baf9e": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												976
											],
											"speed": [
												975
											]
										}
									}
								}
							}
						]
					},
					"45f4e3fd-264b-41a2-83c1-52f7a4a9ac5c": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												1034
											],
											"speed": [
												1033
											]
										}
									}
								}
							}
						]
					},
					"9d9cddc6-f0a6-4749-97a5-778daf4af95d": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												1058
											],
											"speed": [
												1057
											]
										}
									}
								}
							}
						]
					},
					"acfe67e6-de22-4d7c-9d48-377f3348b30e": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												1001
											],
											"speed": [
												1000
											]
										}
									}
								}
							}
						]
					},
					"27cea414-c9ee-446a-ad09-a98fab82d452": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												819
											],
											"speed": [
												818
											]
										}
									}
								}
							}
						]
					},
					"6c1a04d9-c538-4efc-98d3-924103a1f38b": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												870
											],
											"speed": [
												869
											]
										}
									}
								}
							}
						]
					},
					"f7738bec-9ea8-4f37-8afb-2b7a88de2a04": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												985
											],
											"speed": [
												984
											]
										}
									}
								}
							}
						]
					},
					"2fbab8eb-328d-45c1-b658-b6d4b451e271": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												930
											],
											"speed": [
												929
											]
										}
									}
								}
							}
						]
					},
					"7a072033-a592-4a45-b8a9-ea2cd7bafa14": {
						"panels": [
							{
								"type": "windRose",
								"query": {
									"terms": {
										"dataDefinition": {
											"direction": [
												857
											],
											"speed": [
												856
											]
										}
									}
								}
							}
						]
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
				activityUrl: lang.replace(redmicConfig.viewPaths.activityCatalogDetails, {
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
					platform.url = lang.replace(redmicConfig.viewPaths.platformCatalogDetails, {
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
