define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/activity/widget/ActivityAreaMap'
	, 'src/detail/activity/widget/ActivityCitationMap'
	, 'src/detail/activity/widget/ActivityFixedObservationSeriesList'
	, 'src/detail/activity/widget/ActivityFixedObservationSeriesMap'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesLineCharts'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesMap'
	, 'src/detail/activity/widget/ActivityFixedTimeseriesWindrose'
	, 'src/detail/activity/widget/ActivityInfrastructureMap'
	, 'src/detail/activity/widget/ActivityLayerMap'
	, 'src/detail/activity/widget/ActivityTrackingMap'
	, 'src/util/Credentials'
	, 'src/component/base/_Filter'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/ListImpl'
	, 'src/component/browser/bars/Total'
	, 'src/component/layout/genericDisplayer/GenericDisplayer'
	, 'src/component/layout/SupersetDisplayer'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'src/component/map/_ImportWkt'
	, 'src/component/map/LeafletImpl'
	, 'src/design/browser/_AddTotalBarComponent'
	, 'src/design/browser/_BrowserFullSizeDesignLayout'
	, 'src/redmicConfig'
	, 'templates/ContactSet'
	, 'templates/DocumentList'
	, 'templates/OrganisationSet'
	, 'templates/PlatformSet'
], function(
	declare
	, lang
	, ActivityAreaMap
	, ActivityCitationMap
	, ActivityFixedObservationSeriesList
	, ActivityFixedObservationSeriesMap
	, ActivityFixedTimeseriesLineCharts
	, ActivityFixedTimeseriesMap
	, ActivityFixedTimeseriesWindrose
	, ActivityInfrastructureMap
	, ActivityLayerMap
	, ActivityTrackingMap
	, Credentials
	, _Filter
	, _Module
	, _Show
	, _Store
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Total
	, GenericDisplayer
	, SupersetDisplayer
	, TemplateDisplayer
	, _ImportWkt
	, LeafletImpl
	, _AddTotalBarComponent
	, _BrowserFullSizeDesignLayout
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
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'organisations',
					target: this.organisationTarget,
					browserConfig: {
						template: TemplateOrganisation,
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
				}
			};
		},

		_getPlatformsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'platforms',
					target: this.platformTarget,
					browserConfig: {
						template: TemplatePlatform,
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
				}
			};
		},

		_getContactsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'contacts',
					target: this.contactTarget,
					browserConfig: {
						template: TemplateContacts,
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
				}
			};
		},

		_getDocumentsConfig: function(config) {

			return {
				width: 3,
				height: 4,
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'documents',
					target: this.documentTarget,
					browserConfig: {
						template: TemplateDocuments,
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
				}
			};
		},

		_getActivitiesOrProjectsConfig: function(config) {

			return {
				width: config.width || 3,
				height: config.height || 4,
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: config.title,
					target: config.target,
					browserConfig: {
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
				type: ActivityCitationMap,
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
				type: ActivityLayerMap,
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
				type: ActivityInfrastructureMap,
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
				type: ActivityAreaMap,
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
