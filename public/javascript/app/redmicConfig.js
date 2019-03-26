define([], function() {
	//	summary:
	//		Configuraciones y valores globales.

	var retObj = {
		"numMaxView": 10,
		"apiVersion": 1,
		"pathSeparator": "/",
		"oauthClientId": "app",
		"siteKeyReCaptcha": "6LfA6_0SAAAAACT3i8poH1NqztZCtIW1OahT0cXs",
		"siteKeyForDebugReCaptcha": "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
		"googleAnalyticsId": "UA-58848624-1"
	};

	retObj.viewPaths = {
		"activityCatalog": "/catalog/activities-catalog",
		"activityCatalogDetails": "/catalog/activity-info/{id}",
		"activityCatalogDetailsRegister": "/catalog/activity-info/{properties.activityId}",
		"activityCatalogCitationMap": "/catalog/activity-map/{id}",
		"activityCatalogTrackingMap": "/catalog/activity-tracking/{id}",
		"activityCatalogInfrastructureMap": "/catalog/activity-infrastructure/{id}",
		"activityCatalogAreaMap": "/catalog/activity-area/{id}",
		"activityDetails": "/admin/activity-info/{id}",
		"activityAdd": "/admin/activity-add/{id}",
		"activityEdit": "/admin/activity-edit/{id}",
		"activityCitationMap": "/admin/activity-map/{id}",
		"activityTrackingMap": "/admin/activity-tracking/{id}",
		"activityInfrastructureMap": "/admin/activity-infrastructure/{id}",
		"activityAreaMap": "/admin/activity-area/{id}",
		"activityCitation": "/data-loader/activity/{id}/citation",
		"activityInfrastructure": "/data-loader/activity/{id}/infrastructure",
		"activitySurveyStation": "/data-loader/activity/{id}/survey-station",
		"activityObjectCollection": "/data-loader/activity/{id}/object-collection",
		"activityArea": "/data-loader/activity/{id}/area",
		"activityTracking": "/data-loader/activity/{id}/tracking",
		"activityTrackingPoints": "/data-loader/activity/{activityid}/tracking/{id}",
		"activityGeoDataAdd": "/data-loader/activity/{activityid}/geo-data/add/{id}",
		"activityGeoDataEdit": "/data-loader/activity/{activityid}/geo-data/edit/{id}",
		"activityGeoDataLoad": "/data-loader/activity/{activityid}/geo-data/load/{id}",
		"surveyStationDataDefinitions": "/data-loader/activity/{activityid}/survey-station/{id}/series",
		"objectCollectingDataDefinitions": "/data-loader/activity/{activityid}/object-collecting/{id}/series",
		"activityInfrastructureAttributes": "/data-loader/activity/{activityid}/infrastructure/{id}/attributes",
		"activity": "/admin/activity",
		"animalDetails": "/admin/activity-info/{id}",
		"animalAdd": "/admin/animal-add/{id}",
		"animalEdit": "/admin/animal-edit/{id}",
		"animal": "/admin/animal",
		"bibliographyDetails": "/bibliography/document-info/{id}",
		"bibliographyPDF": "/bibliography/document-pdf/{id}",
		"bibliography": "/bibliography",
		"conditionAdd": "/admin/condition-add/{id}",
		"conditionEdit": "/admin/condition-edit/{id}",
		"contactDetails": "/admin/contact-info/{id}",
		"contactAdd": "/admin/contact-add/{id}",
		"contactEdit": "/admin/contact-edit/{id}",
		"contact": "/admin/contact",
		"dataDefinition": "/admin/data-definition",
		"dataDefinitionAdd": "/admin/data-definition-add/{id}",
		"dataDefinitionEdit": "/admin/data-definition-edit/{id}",
		"deviceAdd": "/admin/device-add/{id}",
		"deviceEdit": "/admin/device-edit/{id}",
		"document": "/admin/document",
		"documentDetails": "/admin/document-info/{id}",
		"documentPDF": "/admin/document-pdf/{id}",
		"documentAdd": "/admin/document-add/{id}",
		"documentEdit": "/admin/document-edit/{id}",
		"documentLoad": "/admin/document/load",
		"metricsDefinitionAdd": "/admin/metrics-definition-add/{id}",
		"metricsDefinitionEdit": "/admin/metrics-definition-edit/{id}",
		"misidentificationAdd": "/admin/misidentification-add/{id}",
		"misidentificationEdit": "/admin/misidentification-edit/{id}",
		"misidentification": "/taxons/misidentification",
		"organisationCatalog": "/catalog/organisation-catalog",
		"organisationCatalogDetails": "/catalog/organisation-info/{id}",
		"organisationDetails": "/admin/organisation-info/{id}",
		"organisationAdd": "/admin/organisation-add/{id}",
		"organisationEdit": "/admin/organisation-edit/{id}",
		"organisation": "/admin/organisation",
		"parameterAdd": "/admin/parameter-add/{id}",
		"parameterEdit": "/admin/parameter-edit/{id}",
		"platformCatalog": "/catalog/platform-catalog",
		"platformCatalogDetails": "/catalog/platform-info/{id}",
		"platformDetails": "/admin/platform-info/{id}",
		"platformAdd": "/admin/platform-add/{id}",
		"platformEdit": "/admin/platform-edit/{id}",
		"platform": "/admin/platform",
		"programCatalog": "/catalog/program-catalog",
		"programCatalogDetails": "/catalog/program-info/{id}",
		"programDetails": "/admin/program-info/{id}",
		"programAdd": "/admin/program-add/{id}",
		"programEdit": "/admin/program-edit/{id}",
		"programProject": "/admin/project/program/{id}",
		"program": "/admin/program",
		"projectCatalog": "/catalog/project-catalog",
		"projectCatalogDetails": "/catalog/project-info/{id}",
		"projectDetails": "/admin/project-info/{id}",
		"projectAdd": "/admin/project-add/{id}",
		"projectEdit": "/admin/project-edit/{id}",
		"projectActivity": "/admin/activity/project/{id}",
		"project": "/admin/project",
		/*"serviceOGCCatalog": "/products/service-ogc-catalog",
		"serviceOGCCatalogDetails": "/products/service-ogc-info/{id}",*/

		"realTimeDashboard": "/viewer/real-time-dashboard/{uuid}",

		"serviceOGCCatalog": "/service-ogc-catalog",
		"serviceOGCCatalogDetails": "/service-ogc-catalog/service-ogc-info/{id}",
		"serviceOGCEdit": "/maintenance/service-ogc-edit/{id}",
		"serviceOGCDetails": "/maintenance/service-ogc-info/{id}",
		"serviceOGC": "/maintenance/service-ogc",
		"speciesCatalog": "/catalog/species-catalog",
		"speciesCatalogDetails": "/catalog/species-info/{id}",
		"speciesCatalogLocation": "/catalog/species-location/{id}",
		"speciesDetails": "/admin/species-info/{id}",
		"speciesLocation": "/admin/species-location/{id}",
		"speciesAdd": "/admin/species-add/{id}",
		"speciesEdit": "/admin/species-edit/{id}",
		"species": "/taxon/species",
		"unitAdd": "/admin/unit-add/{id}",
		"unitEdit": "/admin/unit-edit/{id}"
	};

	var baseUri = "/api/",
		baseMediastorageUploads = baseUri + "mediastorage/uploads/";

	retObj.services = {
		"socket": baseUri + "socket",
		"document": baseUri + "documents",
		"accessibility": baseUri + "accessibilities",
		"activity": baseUri + "activities",
		"activityProject": baseUri + "projects/{id}/activities",
		"activityField": baseUri + "activityfields",
		"activityType": baseUri + "activitytypes",
		"activityCategoriesByActivityType": baseUri + "activitytypes/{id}/activitycategories",
		"affiliation": baseUri + "organisations",
		"animal": baseUri + "animals",
		"areaType": baseUri + "areatypes",
		"themeInspire": baseUri + "servicesogc/themeinspire",
		"toponymType": baseUri + "toponymtypes",
		"attributeType": baseUri + "attributetypes",
		"canaryProtection": baseUri + "canaryprotections",
		"trophicRegime": baseUri + "trophicregimes",
		"censingStatus": baseUri + "censingstatuses",
		"citationByDocuments": baseUri + "documents/{id}/citations",
		"calibrations": baseUri + "calibrations",
		"citationAll": baseUri + "citations",
		"citationByActivity": baseUri + "activities/{id}/citations",
		"condition": baseUri + "conditions",
		"confidence": baseUri + "confidences",
		"contact": baseUri + "contacts",
		"contactRole": baseUri + "contactroles",
		"country": baseUri + "countries",
		"dataDefinition": baseUri + "datadefinitions",
		"destiny": baseUri + "destinies",
		"device": baseUri + "devices",
		"deviceType": baseUri + "devicetypes",
		"distribution": baseUri + "distributions",
		"documentType": baseUri + "documenttypes",
		"downloadFile": baseUri + "mediastorage/download",
		"ecology": baseUri + "ecologies",
		"endemicity": baseUri + "endemicities",
		"ending": baseUri + "endings",
		"euProtection": baseUri + "euprotections",
		"eventGroup": baseUri + "eventgroups",

		"taxons": baseUri + "taxons",
		"class": baseUri + "taxons/classes",
		"family": baseUri + "taxons/families",
		"phylum": baseUri + "taxons/phylums",
		"genus": baseUri + "taxons/genuses",
		"kingdom": baseUri + "taxons/kingdoms",
		"order": baseUri + "taxons/orders",
		"subphylum": baseUri + "taxons/subphylums",
		"status": baseUri + "taxons/statuses",
		"misidentification": baseUri + "taxons/misidentifications",
		"species": baseUri + "taxons/species",
		"speciesLocation": baseUri + "taxons/species/{id}/locations",
		"taxonAncestors": baseUri + "taxons/{path}/ancestors",
		"documentByMisidentification": baseUri + "taxons/misidentifications/{id}/documents",
		"activitiesBySpecies": baseUri + "taxons/species/{id}/activities",
		"documentsBySpecies": baseUri + "taxons/species/{id}/documents",
		"worms": baseUri + "taxons/worms",
		"wormsToRedmic": baseUri + "taxons/worms/convert2redmic",
		"wormsUpdate": baseUri + "taxons/worms/update",

		"users": baseUri + "user",
		"accountData": baseUri + "user/accountData",
		"feedback": baseUri + "user/feedback",
		"register": baseUri + "user/register",
		"role": baseUri + "user/roles",
		"userSector": baseUri + "user/sectors",
		"profile": baseUri + "user/profile",
		"activateAccount": baseUri + "user/activateAccount",
		"changeUserSector": baseUri + "user/profile/changeSector",
		"changeEmail": baseUri + "user/profile/changeEmail",
		"resettingRequest": baseUri + "user/profile/resettingRequest",
		"resettingSetPassword": baseUri + "user/profile/resettingSetPassword",
		"changePassword": baseUri + "user/profile/changePassword",
		"changeName": baseUri + "user/profile/changeName",
		"changeUserImage": baseUri + "user/profile/changeImage",

		"uploadUsers": baseMediastorageUploads + "users",
		"uploadContacts": baseMediastorageUploads + "contacts",
		"uploadOrganisations": baseMediastorageUploads + "organisations",
		"uploadPlatforms": baseMediastorageUploads + "platforms",
		"uploadSpecies": baseMediastorageUploads + "species",
		"uploadAnimals": baseMediastorageUploads + "animals",
		"uploadDocuments": baseMediastorageUploads + "documents",
		"uploadData": baseMediastorageUploads + "data",

		"infrastructureByActivity": baseUri + "activities/{id}/infrastructures",
		"infrastructureType": baseUri + "infrastructuretypes",
		"interest": baseUri + "interests",
		"intervalUnit": baseUri + "intervalunits",
		"lifeStage": baseUri + "lifestages",
		"lineType": baseUri + "linetypes",
		"meshType": baseUri + "meshtypes",
		"metricGroup": baseUri + "metricgroups",
		"metricsDefinition": baseUri + "metricdefinitions",

		"module": baseUri + "modules",
		"objectGroup": baseUri + "objectgroups",
		"objectType": baseUri + "objecttypes",
		"observationType": baseUri + "observationtypes",
		"organisation": baseUri + "organisations",
		"organisationRole": baseUri + "organisationroles",
		"organisationType": baseUri + "organisationtypes",
		"origin": baseUri + "origins",
		"parameter": baseUri + "parameters",
		"parameterType": baseUri + "parametertypes",
		"permanence": baseUri + "permanences",
		"platform": baseUri + "platforms",
		"platformType": baseUri + "platformtypes",
		"animalTracking": baseUri + "animaltracking",
		"pointTrackingActivities": baseUri + "tracking/activities",
		"elementsTrackingActivity": baseUri + "activities/{id}/tracking/elements",
		"elementTracking": baseUri + "activities/{activityid}/tracking/elements/{elementuuid}",
		"trackElementTracking": baseUri + "activities/{activityid}/tracking/elements/{elementuuid}/track",
		"pointTrackElementTracking": baseUri + "activities/{activityid}/tracking/elements/{elementuuid}/track/{id}",
		"pointTrackingCluster": baseUri + "activities/{activityid}/tracking/elements/{elementuuid}/track/cluster",
		"animalTrackingActivity": baseUri + "activities/{activityid}/animaltracking",
		"platformTrackingActivity": baseUri + "activities/{activityid}/platformtracking",
		"pointType": baseUri + "pointtypes",
		"program": baseUri + "programs",
		"project": baseUri + "projects",
		"projectProgram": baseUri + "programs/{id}/projects",
		"projectGroup": baseUri + "projectgroups",
		"rank": baseUri + "ranks",
		"rasterType": baseUri + "rastertypes",
		"recordingType": baseUri + "recordingtypes",
		"sampleType": baseUri + "sampletypes",
		"scope": baseUri + "scopes",
		"seaCondition": baseUri + "seaconditions",
		"sex": baseUri + "sexes",
		"shorelineType": baseUri + "shorelinetypes",
		"spainProtection": baseUri + "spainprotections",

		"activityAncestors": baseUri + "activities/{path}/ancestors",
		"speciesValidity": baseUri + "speciesvalidities",
		"themes": baseUri + "themes",
		"thematicType": baseUri + "thematictypes",
		"getToken": "/oauth/token",
		"logout": baseUri + "oauth/token/revoke",
		"unit": baseUri + "units",
		"unitType": baseUri + "unittypes",

		"timeSeries": baseUri + "timeseries",
		"timeSeriesTemporalData": baseUri + "timeseries/temporaldata",
		"timeSeriesWindRose": baseUri + "time-series/view/activities/{id}/timeseries/windrose",

		"activityOrganisations": baseUri + "organisations/{id}/activities",
		"activityPlatforms": baseUri + "platforms/{id}/activities",
		"activityDocuments": baseUri + "documents/{id}/activities",
		"activityContacts": baseUri + "contacts/{id}/activities",

		"atlas": baseUri + "atlas",
		"serviceOGC": baseUri + "servicesogc/layers",
		"serviceOGCCategory": baseUri + "servicesogc/layers/category",
		"serviceOGCRefresh": baseUri + "servicesogc/layers/refresh",
		"statistics": baseUri + "statistics",
		"administrativeStatistics": baseUri + "statistics/administrative",
		"qFlag": baseUri + "qflags",
		"vFlag": baseUri + "vflags",

		"timeSeriesActivities": baseUri + "timeseries/activities",
		"activityTimeSeriesStations": baseUri + "activities/{activityid}/timeseriesstations",
		"timeSeriesStations": baseUri + "surveystations",
		"surveyStationsTimeSeries": baseUri + "datadefinitions/{datadefinitionid}/timeseries",

		"activityObjectCollectingSeriesStations": baseUri +
			"activities/{activityid}/objectcollectingseriesstations",

		"objectCollectingSeries": baseUri + "objectcollectingseries",
		"objectCollectingSeriesByDataDefinition": baseUri +
			"datadefinitions/{datadefinitionid}/objectcollectingseries",

		"objectCollectingSeriesActivities": baseUri + "objectcollectingseries/activities",
		"objectCollectingSeriesTemporalData": baseUri + "objectcollectingseries/temporaldata",
		"objectCollectingSeriesClassification": baseUri + "objectcollectingseries/classification",
		"objectCollectingSeriesClassificationList": baseUri + "objectcollectingseries/classificationlist",
		"convertShapefileToGeoJSON": baseUri + "utils/geo/convert2geojson",

		"attributesByInfrastructure": baseUri + "activities/{activityid}/infrastructures/{id}/attributes",

		"areasByActivity": baseUri + "activities/{activityid}/areas",
		"areasPropertiesByActivity": baseUri + "activities/{activityid}/areas/properties",

		"areaClassifications": baseUri + "areaclassifications",
		"speciesRanks": baseUri + "ranks/speciesranks",


		//	TODO estas cambiarán a plural en el caso en que se usen para consultar/editar los registros,
		//	por ahora solo se usan para obtener los jsonschema asociados
		//	***********************************************************************************
		"specimenTag": baseUri + "specimentag",
		"recovery": baseUri + "recovery",
		"describeSite": baseUri + "fixedsurvey",
		"measurement": baseUri + "measurement",
		"organisationContactRole": baseUri + "organisationcontactrole",
		"organisationrole": baseUri + "organisationrole",
		"platformContactRole": baseUri + "platformcontactrole",
		"calibration": baseUri + "calibration"
		//	***********************************************************************************
	};

	retObj.outerPaths = [
		"login",
		"register",
		"recover-password",
		"terms-and-conditions",
		"what-is-redmic",
		"confirm-recover-password",
		"feedback"
	];

	retObj.isOuterPath = function(path) {

		if (this.outerPaths.indexOf(path) >= 0) {
			return true;
		}

		var pathSplitted = path.split(this.pathSeparator);
		if (this.outerPaths.indexOf(pathSplitted[0]) >= 0) {
			return true;
		}

		return false;
	};

	retObj.getAppScope = function() {

		var actualURL = window.location,
			hostname = actualURL.hostname;

		if (hostname.includes('redmic.local')) {
			return 'dev';
		} else if (hostname.includes('redmic.net')) {
			return 'pre';
		}

		return 'pro';
	};

	return retObj;
});
