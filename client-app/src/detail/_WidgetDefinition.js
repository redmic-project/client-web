define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/activity/widget/ActivityTrackingMap'
	, 'app/details/views/ActivityAreaMapBase'
	, 'app/details/views/ActivityCitationMapBase'
	, 'src/detail/activity/widget/ActivityFixedObservationSeriesList'
	, 'src/detail/activity/widget/ActivityFixedObservationSeriesMap'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesLineCharts'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesMap'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesWindrose'
	, 'app/details/views/ActivityInfrastructureMapBase'
	, 'app/details/views/ActivityLayerMapBase'
	, 'src/util/Credentials'
	, 'src/component/base/_Filter'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/ListImpl'
	, 'src/component/browser/bars/Pagination'
	, 'src/component/browser/bars/Total'
	, 'src/component/layout/genericDisplayer/GenericDisplayer'
	, 'src/component/layout/SupersetDisplayer'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'src/component/map/_ImportWkt'
	, 'src/component/map/LeafletImpl'
	, 'src/redmicConfig'
	, 'templates/ContactSet'
	, 'templates/DocumentList'
	, 'templates/OrganisationSet'
	, 'templates/PlatformSet'
], function(
	declare
	, lang
	, ActivityTrackingMap
	, ActivityAreaMapBase
	, ActivityCitationMapBase
	, ActivityFixedObservationSeriesList
	, ActivityFixedObservationSeriesMap
	, ActivityFixedTimeseriesLineCharts
	, ActivityFixedTimeseriesMap
	, ActivityFixedTimeseriesWindrose
	, ActivityInfrastructureMapBase
	, ActivityLayerMapBase
	, Credentials
	, _Filter
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Pagination
	, Total
	, GenericDisplayer
	, SupersetDisplayer
	, TemplateDisplayer
	, _ImportWkt
	, LeafletImpl
	, redmicConfig
	, TemplateContacts
	, TemplateDocuments
	, TemplateOrganisation
	, TemplatePlatform
) {

	return declare(null, {
		//	summary:
		//		Bloques de configuración de widgets para vistas detalle, para permitir instanciarlos.

		constructor: function(args) {

			this.config = {
				documentTarget: 'documents',
				contactTarget: 'contacts',
				organisationTarget: 'organisations',
				platformTarget: 'platforms'
			};

			lang.mixin(this, this.config, args);
		},

		_getOrganisationsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: 'organisations',
					target: this.organisationTarget,
					template: TemplateOrganisation,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.info,
								href: redmicConfig.viewPaths.organisationDetails,
								pathToItem: 'organisation'
							}]
						}
					}
				}
			};
		},

		_getPlatformsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: 'platforms',
					target: this.platformTarget,
					template: TemplatePlatform,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.info,
								href: redmicConfig.viewPaths.platformDetails,
								pathToItem: 'platform'
							}]
						}
					}
				}
			};
		},

		_getContactsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: 'contacts',
					target: this.contactTarget,
					template: TemplateContacts,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.info,
								href: redmicConfig.viewPaths.contactDetails,
								pathToItem: 'contact'
							}]
						}
					}
				}
			};
		},

		_getDocumentsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: 'documents',
					target: this.documentTarget,
					template: TemplateDocuments,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.info,
								href: redmicConfig.viewPaths.bibliographyDetails
							}]
						}
					}
				}
			};
		},

		_getActivitiesOrProjectsConfig: function(config) {

			return {
				width: config.width || 3,
				height: config.height || 4,
				type: declare([ListImpl, _Framework, _ButtonsInRow, _Filter]),
				props: {
					title: config.title,
					bars: [{
						instance: Total
					},{
						instance: Pagination
					}],
					target: config.target,
					template: config.template,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.info,
								href: config.href,
								condition: function(item) {

									var accessibilityId = item && item.accessibility && item.accessibility.id,
										browseableAccesibilities = [2], // libre
										accessibilityIsBrowseable = accessibilityId &&
											browseableAccesibilities.indexOf(accessibilityId) !== -1;

									return accessibilityIsBrowseable || Credentials.userIsEditor();
								}
							}]
						}
					}
				}
			};
		},

		_getInfoConfig: function(config) {

			return {
				width: config.width || 3,
				height: config.height || 'fitContent',
				type: TemplateDisplayer,
				props: {
					title: 'info',
					template: config.template,
					'class': 'containerDetails',
					classEmptyTemplate: 'contentListNoData',
					target: config.target || this.infoTarget || this.target,
					associatedIds: [this.ownChannel],
					shownOption: this.shownOptionInfo
				}
			};
		},

		_getSpatialExtensionConfig: function(config) {

			return {
				width: 3,
				height: 2,
				hidden: true,
				type: declare([LeafletImpl, _ImportWkt]),
				props: {
					title: 'spatialExtension',
					omitContainerSizeCheck: true,
					maxZoom: 15,
					coordinatesViewer: false,
					navBar: false,
					miniMap: false,
					scaleBar: false,
					measureTools: false
				}
			};
		},

		_getActivityCitationConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityCitationMapBase,
				props: {
					title: 'citations',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityMapLayerConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityLayerMapBase,
				props: {
					title: 'layers',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityTrackingConfig: function(config) {

			var additionalConfig = {};

			if (config && config.accessGranted) {
				additionalConfig.props = {};
				additionalConfig.props.usePrivateTarget = config.accessGranted;
			}

			return this._merge([{
				width: 6,
				height: 6,
				type: ActivityTrackingMap,
				props: {
					title: 'tracking',
					pathVariableId: this._activityData.id
				}
			}, additionalConfig]);
		},

		_getActivityInfrastructureConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityInfrastructureMapBase,
				props: {
					title: 'infrastructures',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityAreaConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityAreaMapBase,
				props: {
					title: 'area',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityFixedObservationSeriesMapConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityFixedObservationSeriesMap,
				props: {
					title: 'associatedObservationStations',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityFixedObservationSeriesListConfig: function(mapKey, config) {

			return {
				width: 6,
				height: 6,
				type: ActivityFixedObservationSeriesList,
				hidden: true,
				props: {
					title: 'associatedObservationRegisters',
					pathVariableId: this._activityData.id,
					timeseriesDataChannel: this._getWidgetInstance(mapKey).getChannel('TIMESERIES_DATA')
				}
			};
		},

		_getActivityFixedTimeseriesMapConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityFixedTimeseriesMap,
				props: {
					title: 'associatedSurveyStation',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityFixedTimeseriesLineChartsConfig: function(config) {

			return {
				width: 6,
				height: 5,
				type: ActivityFixedTimeseriesLineCharts,
				hidden: true,
				props: {
					title: 'charts',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityEmbeddedContentsConfig: function(node, i, config) {

			return {
				width: 6,
				height: 6,
				type: GenericDisplayer,
				props: {
					title: this.i18n.embeddedContent + ' #' + (i + 1),
					content: node
				}
			};
		},

		_getSupersetDashboardConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: SupersetDisplayer,
				props: {
					title: config.title || 'supersetDashboard',
					pathVariableId: this._activityData.id,
					dashboardConfig: config
				}
			};
		},

		_getActivityFixedTimeseriesWindroseConfig: function(config) {

			return {
				width: 3,
				height: 5,
				type: ActivityFixedTimeseriesWindrose,
				props: {
					title: 'windrose',
					pathVariableId: this._activityData.id
				}
			};
		}
	});
});
