define({
	"default": {
		"title": "{i18n.metaDefaultTitle}",
		"description": "{i18n.metaDefaultDescription}.",
		"image": "https://{hostname}/resources/images/logos/redmic-logo-og.jpg",
		"image:alt": "{i18n.metaDefaultImageAlt}.",
		"image:type": "image/jpeg",
		"image:width": "1200",
		"image:height": "630"
	},
	"/home": {
		"title": "{i18n.metaHomeTitle}",
		"description": "{i18n.metaHomeDescription}."
	},
	"/catalog/activities-catalog": {
		"title": "{i18n.metaCatalogActivitiesCatalogTitle}",
		"description": "{i18n.metaCatalogActivitiesCatalogDescription}."
	},
	"/catalog/activity-info/{id}": {
		"title": "{i18n.metaCatalogActivityInfoIdTitle} '{name}'",
		"description": "{i18n.metaCatalogActivityInfoIdDescription} '{name}'. {activityType.name}. {description}."
	},
	"/catalog/project-catalog": {
		"title": "{i18n.metaCatalogProjectCatalogTitle}",
		"description": "{i18n.metaCatalogProjectCatalogDescription}."
	},
	"/catalog/project-info/{id}": {
		"title": "{i18n.metaCatalogProjectInfoIdTitle} '{name}'",
		"description": "{i18n.metaCatalogProjectInfoIdDescription} '{name}'. {projectGroup.name}. {description}."
	},
	"/catalog/program-catalog": {
		"title": "{i18n.metaCatalogProgramCatalogTitle}",
		"description": "{i18n.metaCatalogProgramCatalogDescription}."
	},
	"/catalog/program-info/{id}": {
		"title": "{i18n.metaCatalogProgramInfoIdTitle} '{name}'",
		"description": "{i18n.metaCatalogProgramInfoIdDescription} '{name}'. {description}."
	},
	"/catalog/organisation-catalog": {
		"title": "{i18n.metaCatalogOrganizationCatalogTitle}",
		"description": "{i18n.metaCatalogOrganizationCatalogDescription}."
	},
	"/catalog/organisation-info/{id}": {
		"title": "{i18n.metaCatalogOrganizationInfoIdTitle} '{name}'",
		"description": "{i18n.metaCatalogOrganizationInfoIdDescription} '{name} ({acronym})'. {organisationType.name}. {description}."
	},
	"/catalog/platform-catalog": {
		"title": "{i18n.metaCatalogPlatformCatalogTitle}",
		"description": "{i18n.metaCatalogPlatformCatalogDescription}."
	},
	"/catalog/platform-info/{id}": {
		"title": "{i18n.metaCatalogPlatformInfoIdTitle} '{name}'",
		"description": "{i18n.metaCatalogPlatformInfoIdDescription} '{name}'. {platformType.name}. {description}."
	},
	"/catalog/species-catalog": {
		"title": "{i18n.metaCatalogSpeciesCatalogTitle}",
		"description": "{i18n.metaCatalogSpeciesCatalogDescription}."
	},
	"/catalog/species-info/{id}": {
		"title": "{i18n.metaCatalogSpeciesInfoIdTitle} '{scientificName} {authorship}'",
		"description": "{i18n.metaCatalogSpeciesInfoIdDescription} '{scientificName} {authorship}'. {commonName}."
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
	"/service-ogc-catalog": {
		"title": "{i18n.metaServiceOgcCatalogTitle}",
		"description": "{i18n.metaServiceOgcCatalogDescription}."
	},
	"/service-ogc-catalog/service-ogc-info/{id}": {
		"title": "{i18n.metaServiceOgcCatalogServiceOgcInfoIdTitle} '{title}'",
		"description": "{i18n.metaServiceOgcCatalogDescription} '{title}'. {abstractLayer} [{keywords}]"
	},
	"/bibliography": {
		"title": "{i18n.metaBibliographyTitle}",
		"description": "{i18n.metaBibliographyDescription}"
	},
	"/bibliography/document-info/{id}": {
		"title": "{i18n.metaBibliographyDocumentInfoIdTitle} '{title}'",
		"description": "{i18n.metaBibliographyDocumentInfoIdDescription1} '{title}'. {documentType.name}, {i18n.metaBibliographyDocumentInfoIdDescription2} '{author}' {i18n.metaBibliographyDocumentInfoIdDescription3} {year}. [{keyword}]"
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
