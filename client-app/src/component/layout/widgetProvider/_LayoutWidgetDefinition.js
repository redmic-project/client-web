define([
	'dojo/_base/declare'
	, 'src/component/layout/genericDisplayer/GenericDisplayer'
	, 'src/component/layout/SupersetDisplayer'
	, 'src/detail/activity/widget/ActivityAreaMap'
	, 'src/detail/activity/widget/ActivityCitationMap'
	, 'src/detail/activity/widget/ActivityFixedObservationSeriesList'
	, 'src/detail/activity/widget/ActivityFixedObservationSeriesMap'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesLineCharts'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesMap'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesWindrose'
	, 'src/detail/activity/widget/ActivityGeoRasterMap'
	, 'src/detail/activity/widget/ActivityInfrastructureMap'
	, 'src/detail/activity/widget/ActivityLayerMap'
	, 'src/detail/activity/widget/ActivityTrackingMap'
	, 'src/detail/project/widget/ProjectAcousticDetectionMap'
], function(
	declare
	, GenericDisplayer
	, SupersetDisplayer
	, ActivityAreaMap
	, ActivityCitationMap
	, ActivityFixedObservationSeriesList
	, ActivityFixedObservationSeriesMap
	, ActivityFixedTimeseriesLineCharts
	, ActivityFixedTimeseriesMap
	, ActivityFixedTimeseriesWindrose
	, ActivityGeoRasterMap
	, ActivityInfrastructureMap
	, ActivityLayerMap
	, ActivityTrackingMap
	, ProjectAcousticDetectionMap
) {

	return declare(null, {
		// summary:
		//   Métodos para obtener la configuración (definición y propiedades) de cada widget configurable para layouts.

		_getCitationMapConfig: function(config) {

			return {
				type: ActivityCitationMap,
				props: {
					title: 'citations',
					pathVariableId: config.pathVariableId
				}
			};
		},

		_getOgcLayerMapConfig: function(config) {

			return {
				type: ActivityLayerMap,
				props: {
					title: 'layers',
					pathVariableId: config.pathVariableId
				}
			};
		},

		_getTrackingMapConfig: function(config) {

			return {
				type: ActivityTrackingMap,
				props: {
					title: 'tracking',
					pathVariableId: config.pathVariableId,
					usePrivateTarget: config.accessGranted ?? false
				}
			};
		},

		_getGeoRasterMapConfig: function(config) {

			return {
				type: ActivityGeoRasterMap,
				props: {
					title: 'geoRaster',
					pathVariableId: config.pathVariableId,
					sourceUrl: config.url,
					sourceLabel: config.label
				}
			};
		},

		_getInfrastructureMapConfig: function(config) {

			return {
				type: ActivityInfrastructureMap,
				props: {
					title: 'infrastructures',
					pathVariableId: config.pathVariableId
				}
			};
		},

		_getAreaMapConfig: function(config) {

			return {
				type: ActivityAreaMap,
				props: {
					title: 'area',
					pathVariableId: config.pathVariableId
				}
			};
		},

		_getFixedObservationSeriesMapConfig: function(config) {

			return {
				type: ActivityFixedObservationSeriesMap,
				props: {
					title: 'associatedObservationStations',
					pathVariableId: config.pathVariableId,
					stationDataTarget: config.stationDataTarget
				}
			};
		},

		_getFixedObservationSeriesListConfig: function(config) {

			return {
				type: ActivityFixedObservationSeriesList,
				props: {
					title: 'associatedObservationRegisters',
					pathVariableId: config.pathVariableId,
					stationDataTarget: config.stationDataTarget
				}
			};
		},

		_getFixedTimeseriesMapConfig: function(config) {

			return {
				type: ActivityFixedTimeseriesMap,
				props: {
					title: 'associatedSurveyStation',
					pathVariableId: config.pathVariableId,
					stationDataTarget: config.stationDataTarget
				}
			};
		},

		_getFixedTimeseriesLineChartsConfig: function(config) {

			return {
				type: ActivityFixedTimeseriesLineCharts,
				props: {
					title: 'charts',
					pathVariableId: config.pathVariableId,
					stationDataTarget: config.stationDataTarget
				}
			};
		},

		_getEmbeddedContentConfig: function(config) {

			const contentNode = globalThis.document.createElement('object');
			contentNode.innerHTML = config.content;

			return {
				type: GenericDisplayer,
				props: {
					title: 'embeddedContent',
					content: contentNode
				}
			};
		},

		_getSupersetDashboardConfig: function(config) {

			return {
				type: SupersetDisplayer,
				props: {
					title: config.title || 'supersetDashboard',
					pathVariableId: config.pathVariableId,
					dashboardConfig: config.dashboardConfig
				}
			};
		},

		_getFixedTimeseriesWindroseChartsConfig: function(config) {

			return {
				type: ActivityFixedTimeseriesWindrose,
				props: {
					title: 'windrose',
					pathVariableId: config.pathVariableId
				}
			};
		},

		_getAcousticDetectionMapConfig: function(config) {

			return {
				type: ProjectAcousticDetectionMap,
				props: {
					title: 'acoustic-detection',
					activityIds: config.activityIds
				}
			};
		}
	});
});
