define([
	'dojo/_base/declare'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'src/component/map/_ImportWkt'
	, 'src/component/map/LeafletImpl'
	, 'src/design/browser/_AddTotalBarComponent'
	, 'src/design/browser/_BrowserFullSizeDesignLayout'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
	, 'templates/ContactSet'
	, 'templates/DocumentList'
	, 'templates/OrganisationSet'
	, 'templates/PlatformSet'
], function(
	declare
	, _Module
	, _Show
	, _Store
	, TemplateDisplayer
	, _ImportWkt
	, LeafletImpl
	, _AddTotalBarComponent
	, _BrowserFullSizeDesignLayout
	, redmicConfig
	, Credentials
	, TemplateContacts
	, TemplateDocuments
	, TemplateOrganisation
	, TemplatePlatform
) {

	return declare(null, {
		// summary:
		//   Métodos para obtener la configuración (definición y propiedades) de widgets básicos para vistas detalle.

		_getOrganisationsConfig: function(config) {

			const rowConfig = {
				buttonsConfig: {
					listButton: [{
						icon: 'fa-info-circle',
						btnId: 'details',
						title: this.i18n.info,
						href: redmicConfig.viewPaths.organisationDetails,
						pathToItem: 'organisation'
					}]
				}
			};

			return {
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'organisations',
					target: config.target,
					browserConfig: {
						template: TemplateOrganisation,
						rowConfig
					}
				}
			};
		},

		_getPlatformsConfig: function(config) {

			const rowConfig = {
				buttonsConfig: {
					listButton: [{
						icon: 'fa-info-circle',
						btnId: 'details',
						title: this.i18n.info,
						href: redmicConfig.viewPaths.platformDetails,
						pathToItem: 'platform'
					}]
				}
			};

			return {
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'platforms',
					target: config.target,
					browserConfig: {
						template: TemplatePlatform,
						rowConfig
					}
				}
			};
		},

		_getContactsConfig: function(config) {

			const rowConfig = {
				buttonsConfig: {
					listButton: [{
						icon: 'fa-info-circle',
						btnId: 'details',
						title: this.i18n.info,
						href: redmicConfig.viewPaths.contactDetails,
						pathToItem: 'contact'
					}]
				}
			};

			return {
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'contacts',
					target: config.target,
					browserConfig: {
						template: TemplateContacts,
						rowConfig
					}
				}
			};
		},

		_getDocumentsConfig: function(config) {

			const rowConfig = {
				buttonsConfig: {
					listButton: [{
						icon: 'fa-info-circle',
						btnId: 'details',
						title: this.i18n.info,
						href: redmicConfig.viewPaths.bibliographyDetails
					}]
				}
			};

			return {
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: 'documents',
					target: config.target,
					browserConfig: {
						template: TemplateDocuments,
						rowConfig
					}
				}
			};
		},

		_getActivitiesOrProjectsConfig: function(config) {

			const condition = function(item) {

				const accessibilityId = item?.accessibility?.id,
					browseableAccesibilities = [2], // libre
					accessibilityIsBrowseable = browseableAccesibilities.includes(accessibilityId);

				return accessibilityIsBrowseable || Credentials.userIsEditor();
			};

			const rowConfig = {
				buttonsConfig: {
					listButton: [{
						icon: 'fa-info-circle',
						btnId: 'details',
						title: this.i18n.info,
						href: config.href,
						condition
					}]
				}
			};

			return {
				type: declare([_Module, _Show, _Store, _BrowserFullSizeDesignLayout, _AddTotalBarComponent]),
				props: {
					title: config.title,
					target: config.target,
					browserConfig: {
						template: config.template,
						rowConfig
					}
				}
			};
		},

		_getInfoConfig: function(config) {

			return {
				type: TemplateDisplayer,
				props: {
					title: 'info',
					template: config.template,
					'class': 'containerDetails',
					classEmptyTemplate: 'contentListNoData',
					target: config.target,
					associatedIds: config.associatedIds,
					shownOption: config.shownOption
				}
			};
		},

		_getSpatialExtensionConfig: function(config) {

			return {
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
		}
	});
});
