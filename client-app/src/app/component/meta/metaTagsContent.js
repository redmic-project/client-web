define({
	"default": {
		"title": "{i18n.metaDefaultTitle}",
		"description": "{i18n.metaDefaultDescription}.",
		"image": "https://{hostname}/res/images/logos/redmic-logo-og.jpg",
		"image:alt": "{i18n.metaDefaultImageAlt}.",
		"image:type": "image/jpeg",
		"image:width": "1200",
		"image:height": "630"
	},
	"/home": {
		"title": "{i18n.metaHomeTitle}",
		"description": "{i18n.metaHomeDescription}."
	},
	"/catalog/activity-catalog": {
		"title": "{i18n.metaActivityCatalogTitle}",
		"description": "{i18n.metaActivityCatalogDescription}."
	},
	"/catalog/activity-info/{id}": {
		"title": "{i18n.metaActivityInfoTitle} '{name}'",
		"description": "{i18n.metaActivityInfoDescription} '{name}'. {activityType.name}. {description}."
	},
	"/bibliography": {
		"title": "{i18n.metaBibliographyCatalogTitle}",
		"description": "{i18n.metaBibliographyCatalogDescription}"
	},
	"/bibliography/document-info/{id}": {
		"title": "{i18n.metaBibliographyInfoTitle} '{title}'",
		"description": "{i18n.metaBibliographyInfoDescription1} '{title}'. {documentType.name}, {i18n.metaBibliographyInfoDescription2} '{author}' {i18n.metaBibliographyInfoDescription3} {year}. [{keyword}]"
	},
	"/service-ogc-catalog": {
		"title": "{i18n.metaOgcServiceCatalogTitle}",
		"description": "{i18n.metaOgcServiceCatalogDescription}."
	},
	"/service-ogc-catalog/service-ogc-info/{id}": {
		"title": "{i18n.metaOgcServiceInfoTitle} '{title}'",
		"description": "{i18n.metaOgcServiceInfoDescription} '{title}'. {abstractLayer} [{keywords}]"
	},
	"/catalog/organisation-catalog": {
		"title": "{i18n.metaOrganizationCatalogTitle}",
		"description": "{i18n.metaOrganizationCatalogDescription}."
	},
	"/catalog/organisation-info/{id}": {
		"title": "{i18n.metaOrganizationInfoTitle} '{name}'",
		"description": "{i18n.metaOrganizationInfoDescription} '{name} ({acronym})'. {organisationType.name}. {description}."
	},
	"/catalog/platform-catalog": {
		"title": "{i18n.metaPlatformCatalogTitle}",
		"description": "{i18n.metaPlatformCatalogDescription}."
	},
	"/catalog/platform-info/{id}": {
		"title": "{i18n.metaPlatformInfoTitle} '{name}'",
		"description": "{i18n.metaPlatformInfoDescription} '{name}'. {platformType.name}. {description}."
	},
	"/catalog/program-catalog": {
		"title": "{i18n.metaProgramCatalogTitle}",
		"description": "{i18n.metaProgramCatalogDescription}."
	},
	"/catalog/program-info/{id}": {
		"title": "{i18n.metaProgramInfoTitle} '{name}'",
		"description": "{i18n.metaProgramInfoDescription} '{name}'. {description}."
	},
	"/catalog/project-catalog": {
		"title": "{i18n.metaProjectCatalogTitle}",
		"description": "{i18n.metaProjectCatalogDescription}."
	},
	"/catalog/project-info/{id}": {
		"title": "{i18n.metaProjectInfoTitle} '{name}'",
		"description": "{i18n.metaProjectInfoDescription} '{name}'. {projectGroup.name}. {description}."
	},
	"/catalog/raster-catalog": {
		"title": "{i18n.metaRasterCatalogTitle}",
		"description": "{i18n.metaRasterCatalogDescription}."
	},
	"/catalog/species-catalog": {
		"title": "{i18n.metaSpeciesCatalogTitle}",
		"description": "{i18n.metaSpeciesCatalogDescription}."
	},
	"/catalog/species-info/{id}": {
		"title": "{i18n.metaSpeciesInfoTitle} '{scientificName} {authorship}'",
		"description": "{i18n.metaSpeciesInfoDescription} '{scientificName} {authorship}'. {commonName}."
	},
	"/viewer/species-distribution": {
		"title": "{i18n.metaViewerSpeciesDistributionTitle}",
		"description": "{i18n.metaViewerSpeciesDistributionDescription}."
	},
	"/viewer/tracking": {
		"title": "{i18n.metaViewerTrackingTitle}",
		"description": "{i18n.metaViewerTrackingDescription}."
	},
	"/viewer/charts": {
		"title": "{i18n.metaViewerChartsTitle}",
		"description": "{i18n.metaViewerChartsDescription}"
	},
	"/viewer/trash-collection": {
		"title": "{i18n.metaViewerTrashCollectionTitle}",
		"description": "{i18n.metaViewerTrashCollectionDescription}."
	},
	"/viewer/real-time": {
		"title": "{i18n.metaViewerRealTimeTitle}",
		"description": "{i18n.metaViewerRealTimeDescription}."
	},
	"/viewer/real-time-dashboard/{id}": {
		"title": "{i18n.metaViewerRealTimeDashboardIdTitle} '{properties.site.name}'",
		"description": "{i18n.metaViewerRealTimeDashboardIdDescription} '{properties.site.name}'. {properties.site.description}."
	},
	"/atlas": {
		"title": "{i18n.metaAtlasTitle}",
		"description": "{i18n.metaAtlasDescription}."
	},
	"/login": {
		"title": "{i18n.metaLoginTitle}",
		"description": "{i18n.metaLoginDescription}."
	},
	"/register": {
		"title": "{i18n.metaRegisterTitle}",
		"description": "{i18n.metaRegisterDescription}."
	},
	"/terms-and-conditions": {
		"title": "{i18n.metaTermsAndConditionsTitle}",
		"description": "{i18n.metaTermsAndConditionsDescription}."
	},
	"/inner-terms-and-conditions": {
		"title": "{i18n.metaInnerTermsAndConditionsTitle}",
		"description": "{i18n.metaInnerTermsAndConditionsDescription}."
	},
	"/what-is-redmic": {
		"title": "{i18n.metaWhatIsRedmicTitle}",
		"description": "{i18n.metaWhatIsRedmicDescription}."
	},
	"/inner-what-is-redmic": {
		"title": "{i18n.metaInnerWhatIsRedmicTitle}",
		"description": "{i18n.metaInnerWhatIsRedmicDescription}."
	},
	"/feedback": {
		"title": "{i18n.metaFeedbackTitle}",
		"description": "{i18n.metaFeedbackDescription}."
	},
	"/recover-password": {
		"title": "{i18n.metaRecoverPasswordTitle}",
		"description": "{i18n.metaRecoverPasswordDescription}."
	},
	"/confirm-recover-password": {
		"title": "{i18n.metaConfirmRecoverPasswordTitle}",
		"description": "{i18n.metaConfirmRecoverPasswordDescription}."
	}
});
