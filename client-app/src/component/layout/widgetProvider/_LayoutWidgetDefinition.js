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
	, 'src/detail/activity/widget/ActivityAcousticDetectionMap'
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
	, ActivityAcousticDetectionMap
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
					pathVariableId: config.pathVariableId
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

			const content = globalThis.document.createElement('div');

			content.classList.add('embeddedContent');
			content.innerHTML = config.content ?? `
				<div class="missingEmbeddedContent">
					<i class="fa fa-eye-slash"></i><span>${this.i18n.missingEmbeddedContent}</span>
				</div>`;

			return {
				type: GenericDisplayer,
				props: {
					title: config.title ?? 'embeddedContent',
					content
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

		_getProjectAcousticDetectionMapConfig: function(config) {

			return {
				type: ProjectAcousticDetectionMap,
				props: {
					title: 'acoustic-detection',
					activityIds: config.activityIds
				}
			};
		},

		_getAcousticDetectionMapConfig: function(config) {

			return {
				type: ActivityAcousticDetectionMap,
				props: {
					title: 'acoustic-detection',
					pathVariableId: config.pathVariableId
				}
			};
		}
	});
});
