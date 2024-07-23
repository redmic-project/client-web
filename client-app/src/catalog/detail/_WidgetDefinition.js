define([
	'src/redmicConfig'
	, 'app/designs/details/main/ActivityTrackingMap'
	, 'app/details/views/ActivityAreaMapBase'
	, 'app/details/views/ActivityCitationMapBase'
	, 'app/details/views/ActivityFixedTimeseriesChart'
	, 'app/details/views/ActivityFixedTimeseriesMap'
	, 'app/details/views/ActivityInfrastructureMapBase'
	, 'app/details/views/ActivityLayerMapBase'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/utils/Credentials'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/_Framework'
	, 'redmic/modules/browser/ListImpl'
	, 'redmic/modules/browser/bars/Pagination'
	, 'redmic/modules/browser/bars/Total'
	, 'redmic/modules/layout/genericDisplayer/GenericDisplayer'
	, 'redmic/modules/layout/templateDisplayer/TemplateDisplayer'
	, 'redmic/modules/map/_ImportWkt'
	, 'redmic/modules/map/LeafletImpl'
	, 'templates/ContactSet'
	, 'templates/DocumentList'
	, 'templates/OrganisationSet'
	, 'templates/PlatformSet'
], function(
	redmicConfig
	, ActivityTrackingMap
	, ActivityAreaMapBase
	, ActivityCitationMapBase
	, ActivityFixedTimeseriesChart
	, ActivityFixedTimeseriesMap
	, ActivityInfrastructureMapBase
	, ActivityLayerMapBase
	, declare
	, lang
	, Credentials
	, _Filter
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Pagination
	, Total
	, GenericDisplayer
	, TemplateDisplayer
	, _ImportWkt
	, LeafletImpl
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
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: this.i18n.organisations,
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
								href: this.viewPathsWidgets.organisations,
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
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: this.i18n.platforms,
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
								href: this.viewPathsWidgets.platforms,
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
				height: 2,
				type: declare([ListImpl, _Framework]),
				props: {
					title: this.i18n.contacts,
					target: this.contactTarget,
					template: TemplateContacts,
					bars: [{
						instance: Total
					}]
				}
			};
		},

		_getDocumentsConfig: function(config) {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: this.i18n.documents,
					target: this.documentTarget,
					template: TemplateDocuments,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-file-pdf-o',
								btnId: 'downloadPdf',
								title: this.i18n.download,
								condition: 'url',
								href: redmicConfig.viewPaths.bibliographyDetails
							},{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.info,
								href: this.viewPathsWidgets.documents
							}]
						}
					}
				}
			};
		},

		_getActivitiesOrProjectsConfig: function(config) {

			return {
				width: 3,
				height: 2,
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
											browseableAccesibilities.indexOf(accessibilityId) !== -1,
										userRoleIsAdmin = Credentials.get('userRole') === 'ROLE_ADMINISTRATOR';

									return accessibilityIsBrowseable || userRoleIsAdmin;
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
				height: config.height || 6,
				type: TemplateDisplayer,
				props: {
					title: this.i18n.info,
					template: config.template,
					'class': 'containerDetails',
					classEmptyTemplate: 'contentListNoData',
					target: config.target || this.infoTarget || this.target,
					associatedIds: [this.ownChannel],
					shownOption: this.shownOptionInfo
				}
			};
		},

		_getSpatialExtensionMapConfig: function(config) {

			return {
				width: 3,
				height: 2,
				hidden: true,
				type: declare([LeafletImpl, _ImportWkt]),
				props: {
					title: this.i18n.spatialExtension,
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
					windowTitle: 'citations',
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
					windowTitle: 'layers',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityTrackingConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityTrackingMap,
				props: {
					windowTitle: 'tracking',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityInfrastructureConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityInfrastructureMapBase,
				props: {
					windowTitle: 'infrastructures',
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
					windowTitle: 'area',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityFixedTimeseriesMapConfig: function(config) {

			return {
				width: 6,
				height: 6,
				type: ActivityFixedTimeseriesMap,
				props: {
					windowTitle: 'associatedSurveyStation',
					pathVariableId: this._activityData.id
				}
			};
		},

		_getActivityFixedTimeseriesChartConfig: function(mapKey) {

			return {
				width: 6,
				height: 6,
				type: ActivityFixedTimeseriesChart,
				props: {
					windowTitle: 'charts',
					pathVariableId: this._activityData.id,
					timeseriesDataChannel: this._getWidgetInstance(mapKey).getChannel('TIMESERIES_DATA')
				}
			};
		},

		_getActivityEmbeddedContentsConfig: function(node, i) {

			return {
				width: 6,
				height: 6,
				type: GenericDisplayer,
				props: {
					title: this.i18n.embeddedContent + ' #' + (i + 1),
					content: node
				}
			};
		}
	});
});
