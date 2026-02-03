define([], function() {
	//	summary:
	//		Configuraciones y valores globales.

	const retObj = {
		'siteKeyReCaptcha': '6LefmUIUAAAAAA2BttWmfpK5lYMn5Bl53KFDdzPe',
		'siteKeyForDebugReCaptcha': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		'googleTagManagerId': 'GTM-PK5MH63C',
		'googleTagManagerDevId': 'GTM-WJZRQZLZ',
		'apiUrlVariable': '{apiUrl}'
	};

	retObj.viewPaths = {
		'activityCatalog': '/catalog/activity-catalog',
		'activityDetails': '/catalog/activity-info/{id}',
		'activityAdd': '/catalog/activity-add/{id}',
		'activityEdit': '/catalog/activity-edit/{id}',
		'activityCatalogDetailsRegister': '/catalog/activity-info/{properties.activityId}',
		'activityCitation': '/data-loader/activity/{id}/citation',
		'activityInfrastructure': '/data-loader/activity/{id}/infrastructure',
		'activitySurveyStation': '/data-loader/activity/{id}/survey-station',
		'activityObjectCollection': '/data-loader/activity/{id}/object-collection',
		'activityArea': '/data-loader/activity/{id}/area',
		'activityTracking': '/data-loader/activity/{id}/tracking',
		'activityTrackingPoints': '/data-loader/activity/{activityid}/tracking/{id}',
		'activityGeoDataAdd': '/data-loader/activity/{activityid}/geo-data/add/{id}',
		'activityGeoDataEdit': '/data-loader/activity/{activityid}/geo-data/edit/{id}',
		'activityGeoDataLoad': '/data-loader/activity/{activityid}/geo-data/load/{id}',
		'surveyStationDataDefinitions': '/data-loader/activity/{activityid}/survey-station/{id}/series',
		'objectCollectingDataDefinitions': '/data-loader/activity/{activityid}/object-collecting/{id}/series',
		'activityInfrastructureAttributes': '/data-loader/activity/{activityid}/infrastructure/{id}/attributes',
		'animalCatalog': '/catalog/animal-catalog',
		'animalDetails': '/catalog/animal-info/{id}',
		'animalAdd': '/catalog/animal-add/{id}',
		'animalEdit': '/catalog/animal-edit/{id}',
		'bibliography': '/bibliography',
		'bibliographyDetails': '/bibliography/document-info/{id}',
		'bibliographyAdd': '/bibliography/document-add/{id}',
		'bibliographyEdit': '/bibliography/document-edit/{id}',
		'bibliographyLoad': '/bibliography/document/load',
		'conditionAdd': '/maintenance/condition-add/{id}',
		'conditionEdit': '/maintenance/condition-edit/{id}',
		'contactCatalog': '/catalog/contact-catalog',
		'contactDetails': '/catalog/contact-info/{id}',
		'contactAdd': '/catalog/contact-add/{id}',
		'contactEdit': '/catalog/contact-edit/{id}',
		'dataDefinition': '/maintenance/data-definition',
		'dataDefinitionAdd': '/maintenance/data-definition-add/{id}',
		'dataDefinitionEdit': '/maintenance/data-definition-edit/{id}',
		'deviceAdd': '/catalog/device-add/{id}',
		'deviceEdit': '/catalog/device-edit/{id}',
		'metricsDefinitionAdd': '/maintenance/metrics-definition-add/{id}',
		'metricsDefinitionEdit': '/maintenance/metrics-definition-edit/{id}',
		'organisationCatalog': '/catalog/organisation-catalog',
		'organisationDetails': '/catalog/organisation-info/{id}',
		'organisationAdd': '/catalog/organisation-add/{id}',
		'organisationEdit': '/catalog/organisation-edit/{id}',
		'parameterAdd': '/maintenance/parameter-add/{id}',
		'parameterEdit': '/maintenance/parameter-edit/{id}',
		'platformCatalog': '/catalog/platform-catalog',
		'platformDetails': '/catalog/platform-info/{id}',
		'platformAdd': '/catalog/platform-add/{id}',
		'platformEdit': '/catalog/platform-edit/{id}',
		'programCatalog': '/catalog/program-catalog',
		'programDetails': '/catalog/program-info/{id}',
		'programAdd': '/catalog/program-add/{id}',
		'programEdit': '/catalog/program-edit/{id}',
		'projectCatalog': '/catalog/project-catalog',
		'projectDetails': '/catalog/project-info/{id}',
		'projectAdd': '/catalog/project-add/{id}',
		'projectEdit': '/catalog/project-edit/{id}',
		'ogcServiceCatalog': '/service-ogc-catalog',
		'ogcServiceDetails': '/service-ogc-catalog/service-ogc-info/{id}',
		'ogcServiceEdit': '/maintenance/service-ogc-edit/{id}',
		'speciesCatalog': '/catalog/species-catalog',
		'speciesDetails': '/catalog/species-info/{id}',
		'speciesAdd': '/catalog/species-add/{id}',
		'speciesEdit': '/catalog/species-edit/{id}',
		'unitAdd': '/maintenance/unit-add/{id}',
		'unitEdit': '/maintenance/unit-edit/{id}'
	};

	retObj.schemas = {
		'{apiUrl}/citations/_search': '{apiUrl}/citations/_search/_schema'
	};

	retObj.services = {
		'grafcan': 'https://visor.grafcan.es/busquedas/toponimo',
		'socket': '{apiUrl}/socket',
		'document': '{apiUrl}/documents',
		'accessibility': '{apiUrl}/accessibilities',
		'activity': '{apiUrl}/activities',
		'activityResource': '{apiUrl}/activities/resources',
		'activityProject': '{apiUrl}/projects/{id}/activities',
		'activityField': '{apiUrl}/activityfields',
		'activityType': '{apiUrl}/activitytypes',
		'activityCategoriesByActivityType': '{apiUrl}/activitytypes/{id}/activitycategories',
		'affiliation': '{apiUrl}/organisations',
		'animal': '{apiUrl}/animals',
		'areaType': '{apiUrl}/areatypes',
		'themeInspire': '{apiUrl}/atlas/view/themeinspire',
		'themeInspireEdition': '{apiUrl}/atlas/commands/themeinspire',
		'toponymType': '{apiUrl}/toponymtypes',
		'attributeType': '{apiUrl}/attributetypes',
		'canaryProtection': '{apiUrl}/canaryprotections',
		'trophicRegime': '{apiUrl}/trophicregimes',
		'censingStatus': '{apiUrl}/censingstatuses',
		'citationByDocuments': '{apiUrl}/documents/{id}/citations',
		'calibrations': '{apiUrl}/calibrations',
		'citationInfo': '{apiUrl}/citations',
		'citationAll': '{apiUrl}/citations/_search',
		'citationByActivity': '{apiUrl}/activities/{id}/citations/_search',
		'condition': '{apiUrl}/conditions',
		'confidence': '{apiUrl}/confidences',
		'contact': '{apiUrl}/contacts',
		'contactRole': '{apiUrl}/contactroles',
		'country': '{apiUrl}/countries',
		'dataDefinition': '{apiUrl}/datadefinitions',
		'destiny': '{apiUrl}/destinies',
		'device': '{apiUrl}/devices',
		'deviceType': '{apiUrl}/devicetypes',
		'distribution': '{apiUrl}/distributions',
		'distributionData': '{apiUrl}/distributions/{grid}/_search',
		'distributionInfo': '{apiUrl}/distributions/{grid}/{tile}/_search',
		'documentType': '{apiUrl}/documenttypes',
		'downloadFile': '{apiUrl}/mediastorage/download',
		'ecology': '{apiUrl}/ecologies',
		'endemicity': '{apiUrl}/endemicities',
		'ending': '{apiUrl}/endings',
		'euProtection': '{apiUrl}/euprotections',
		'eventGroup': '{apiUrl}/eventgroups',

		'taxons': '{apiUrl}/taxons',
		'class': '{apiUrl}/taxons/classes',
		'family': '{apiUrl}/taxons/families',
		'phylum': '{apiUrl}/taxons/phylums',
		'genus': '{apiUrl}/taxons/genuses',
		'kingdom': '{apiUrl}/taxons/kingdoms',
		'order': '{apiUrl}/taxons/orders',
		'subphylum': '{apiUrl}/taxons/subphylums',
		'status': '{apiUrl}/taxons/statuses',
		'species': '{apiUrl}/taxons/species',
		'speciesLocation': '{apiUrl}/taxons/species/{id}/locations/_search',
		'taxonAncestors': '{apiUrl}/taxons/{path}/ancestors',
		'documentByMisidentification': '{apiUrl}/taxons/misidentifications/{id}/documents',
		'activitiesBySpecies': '{apiUrl}/taxons/species/{id}/activities',
		'documentsBySpecies': '{apiUrl}/taxons/species/{id}/documents',
		'worms': '{apiUrl}/taxons/worms',
		'wormsToRedmic': '{apiUrl}/taxons/worms/convert2redmic',

		'users': '{apiUrl}/user',
		'accountData': '{apiUrl}/user/accountData',
		'feedback': '{apiUrl}/user/feedback',
		'register': '{apiUrl}/user/register',
		'role': '{apiUrl}/user/roles',
		'userSector': '{apiUrl}/user/sectors',
		'profile': '{apiUrl}/user/profile/',
		'activateAccount': '{apiUrl}/user/activateAccount',
		'changeUserSector': '{apiUrl}/user/profile/changeSector',
		'changeEmail': '{apiUrl}/user/profile/changeEmail',
		'resettingRequest': '{apiUrl}/user/profile/resettingRequest',
		'resettingSetPassword': '{apiUrl}/user/profile/resettingSetPassword',
		'changePassword': '{apiUrl}/user/profile/changePassword',
		'changeName': '{apiUrl}/user/profile/changeName',
		'changeUserImage': '{apiUrl}/user/profile/changeImage',
		'getSupersetToken': '{apiUrl}/user/superset/get-token',

		'uploadUsers': '{apiUrl}/mediastorage/uploads/users',
		'uploadContacts': '{apiUrl}/mediastorage/uploads/contacts',
		'uploadOrganisations': '{apiUrl}/mediastorage/uploads/organisations',
		'uploadPlatforms': '{apiUrl}/mediastorage/uploads/platforms',
		'uploadSpecies': '{apiUrl}/mediastorage/uploads/species',
		'uploadAnimals': '{apiUrl}/mediastorage/uploads/animals',
		'uploadDocuments': '{apiUrl}/mediastorage/uploads/documents',
		'uploadData': '{apiUrl}/mediastorage/uploads/data',

		'infrastructureByActivity': '{apiUrl}/activities/{id}/infrastructures/_search',
		'infrastructureType': '{apiUrl}/infrastructuretypes',
		'interest': '{apiUrl}/interests',
		'intervalUnit': '{apiUrl}/intervalunits',
		'lifeStage': '{apiUrl}/lifestages',
		'lineType': '{apiUrl}/linetypes',
		'meshType': '{apiUrl}/meshtypes',
		'metricGroup': '{apiUrl}/metricgroups',
		'metricsDefinition': '{apiUrl}/metricdefinitions',

		'module': '{apiUrl}/modules',
		'objectGroup': '{apiUrl}/objectgroups',
		'objectType': '{apiUrl}/objecttypes',
		'observationType': '{apiUrl}/observationtypes',
		'organisation': '{apiUrl}/organisations',
		'organisationRole': '{apiUrl}/organisationroles',
		'organisationType': '{apiUrl}/organisationtypes',
		'origin': '{apiUrl}/origins',
		'parameter': '{apiUrl}/parameters',
		'parameterType': '{apiUrl}/parametertypes',
		'permanence': '{apiUrl}/permanences',
		'platform': '{apiUrl}/platforms',
		'platformType': '{apiUrl}/platformtypes',
		'animalTracking': '{apiUrl}/animaltracking',
		'pointTrackingActivities': '{apiUrl}/tracking/activities',
		'trackingActivity': '{apiUrl}/activities/{id}/tracking',
		'elementsTrackingActivity': '{apiUrl}/activities/{id}/tracking/elements',
		'privateElementsTrackingActivity': '{apiUrl}/private/activities/{id}/tracking/elements',
		'elementTracking': '{apiUrl}/activities/{activityid}/tracking/elements/{elementuuid}',
		'trackElementTracking': '{apiUrl}/activities/{activityid}/tracking/elements/{elementuuid}/track',
		'pointTrackElementTracking': '{apiUrl}/activities/{activityid}/tracking/elements/{elementuuid}/track/{id}',
		'pointTrackingCluster': '{apiUrl}/activities/{activityid}/tracking/elements/{elementuuid}/track/cluster/_search',
		'privatePointTrackingCluster': '{apiUrl}/private/activities/{activityid}/tracking/elements/{elementuuid}/track/cluster',
		'animalTrackingActivity': '{apiUrl}/activities/{activityid}/animaltracking',
		'platformTrackingActivity': '{apiUrl}/activities/{activityid}/platformtracking',
		'pointType': '{apiUrl}/pointtypes',
		'program': '{apiUrl}/programs',
		'project': '{apiUrl}/projects',
		'projectProgram': '{apiUrl}/programs/{id}/projects',
		'projectGroup': '{apiUrl}/projectgroups',
		'rank': '{apiUrl}/ranks',
		'rasterType': '{apiUrl}/rastertypes',
		'recordingType': '{apiUrl}/recordingtypes',
		'sampleType': '{apiUrl}/sampletypes',
		'scope': '{apiUrl}/scopes',
		'seaCondition': '{apiUrl}/seaconditions',
		'sex': '{apiUrl}/sexes',
		'shorelineType': '{apiUrl}/shorelinetypes',
		'spainProtection': '{apiUrl}/spainprotections',

		'activityAncestors': '{apiUrl}/activities/{path}/ancestors',
		'speciesValidity': '{apiUrl}/speciesvalidities',
		'themes': '{apiUrl}/themes',
		'thematicType': '{apiUrl}/thematictypes',
		'getOauthToken': '/oauth/token',
		'logoutOauth': '/oauth/revoke',
		'getOidToken': '/oid/token',
		'logoutOid': '/oid/revoke',
		'refreshToken': '/oid/refresh',
		'getTokenPayload': '/oid/payload',
		'getExternalConfig': '/config',
		'unit': '{apiUrl}/units',
		'unitType': '{apiUrl}/unittypes',

		'timeSeries': '{apiUrl}/timeseries',
		'timeSeriesTemporalData': '{apiUrl}/time-series/view/temporaldata',
		'timeSeriesWindRose': '{apiUrl}/time-series/view/activities/{id}/windrose',

		'activityOrganisations': '{apiUrl}/organisations/{id}/activities',
		'activityPlatforms': '{apiUrl}/platforms/{id}/activities',
		'activityDocuments': '{apiUrl}/documents/{id}/activities',
		'activityContacts': '{apiUrl}/contacts/{id}/activities',

		'atlasLayer': '{apiUrl}/atlas/view/layer',
		'atlasLayerEdition': '{apiUrl}/atlas/commands/layer',
		'atlasLayerSelection': '{apiUrl}/atlas/{endpoint}/layer/settings',
		'atlasLayerRefresh': '{apiUrl}/atlas/commands/layer/refresh',
		'atlasLayerDiscovery': '{apiUrl}/atlas/commands/discover-layers',
		'atlasCategory': '{apiUrl}/atlas/view/category',
		'atlasCategoryEdition': '{apiUrl}/atlas/commands/category',

		'statistics': '{apiUrl}/statistics',
		'administrativeStatistics': '{apiUrl}/statistics/administrative',
		'qFlag': '{apiUrl}/qflags',
		'vFlag': '{apiUrl}/vflags',

		'timeSeriesActivities': '{apiUrl}/timeseries/activities',
		'activityTimeSeriesStations': '{apiUrl}/activities/{activityid}/timeseriesstations/_search',
		'acousticDetectionReceptors': '{apiUrl}/v1/acoustic-detection/activities/{id}/receptors',
		'acousticDetectionEvents': '{apiUrl}/v1/acoustic-detection/activities/{activityid}/receptors/{receptorid}/detections',
		'acousticDistribution': '{apiUrl}/v1/acoustic-detection/stats/distribution',
		'timeSeriesStations': '{apiUrl}/surveystations',
		'surveyStationsTimeSeries': '{apiUrl}/datadefinitions/{datadefinitionid}/timeseries',

		'activityObjectCollectingSeriesStations': '{apiUrl}/activities/{activityid}/objectcollectingseriesstations/_search',

		'objectCollectingSeries': '{apiUrl}/time-series/view/objectcollectingseries',
		'objectCollectingSeriesByDataDefinition': '{apiUrl}/datadefinitions/{datadefinitionid}/objectcollectingseries',

		'objectCollectingSeriesActivities': '{apiUrl}/objectcollectingseries/activities',
		'objectCollectingSeriesTemporalData': '{apiUrl}/time-series/view/objectcollectingseries/temporaldata',
		'objectCollectingSeriesClassification': '{apiUrl}/time-series/view/objectcollectingseries/classification',
		'objectCollectingSeriesClassificationList': '{apiUrl}/time-series/view/objectcollectingseries/classificationlist',
		'convertShapefileToGeoJSON': '{apiUrl}/utils/geo/convert2geojson',

		'attributesByInfrastructure': '{apiUrl}/activities/{activityid}/infrastructures/{id}/attributes',

		'areasByActivity': '{apiUrl}/activities/{activityid}/areas/_search',
		'areasPropertiesByActivity': '{apiUrl}/activities/{activityid}/areas/properties',

		'areaClassifications': '{apiUrl}/areaclassifications',
		'speciesRanks': '{apiUrl}/ranks/speciesranks',


		//	TODO estas cambiarán a plural en el caso en que se usen para consultar/editar los registros,
		//	por ahora solo se usan para obtener los jsonschema asociados
		//	***********************************************************************************
		'specimenTag': '{apiUrl}/specimentag',
		'recovery': '{apiUrl}/recovery',
		'describeSite': '{apiUrl}/fixedsurvey',
		'measurement': '{apiUrl}/measurement',
		'organisationContactRole': '{apiUrl}/organisationcontactrole',
		'organisationrole': '{apiUrl}/organisationrole',
		'platformContactRole': '{apiUrl}/platformcontactrole',
		'calibration': '{apiUrl}/calibration'
		//	***********************************************************************************
	};

	retObj.aggregations = {
		activity: {
			themeInspire: {
				field: 'themeInspire.name'
			},
			activityType: {
				field: 'activityType.name'
			},
			territorialScope: {
				field: 'scope.name'
			}
		},
		activityType: {
			activityField: {
				field: 'activityField.name'
			}
		},
		animal: {
			sex: {
				field: 'sex.name'
			},
			lifeStage: {
				field: 'lifeStage.name'
			}
		},
		atlasLayer: {
			protocols: {
				field: 'protocols.type',
				nested: 'protocols'
			},
			themeInspire: {
				field: 'themeInspire.name'
			},
			keywords: {
				field: 'keywords'
			}
		},
		contact: {
			organisation: {
				field: 'affiliation.name'
			}
		},
		device: {
			deviceType: {
				field: 'deviceType.name'
			}
		},
		document: {
			documentType: {
				field: 'documentType.name'
			},
			language: {
				field: 'language'
			}
		},
		metricsDefinition: {
			metricGroup: {
				field: 'metricGroup.name'
			}
		},
		acousticDetectionEvents: {
			animal: {
				field: 'animals'
			},
			species: {
				field: 'taxons'
			},
			organisation: {
				field: 'organisations'
			}
		},
		organisation: {
			organisationType: {
				field: 'organisationType.name'
			}
		},
		parameter: {
			parameterType: {
				field: 'parameterType.name'
			}
		},
		platform: {
			platformType: {
				field: 'platformType.name'
			}
		},
		program: {
			territorialScope: {
				field: 'scope.name'
			}
		},
		project: {
			projectGroup: {
				field: 'projectGroup.name'
			},
			territorialScope: {
				field: 'scope.name'
			}
		},
		species: {
			status: {
				field: 'status.name'
			},
			origin: {
				field: 'peculiarity.origin.name'
			},
			endemicity: {
				field: 'peculiarity.endemicity.name'
			},
			permanence: {
				field: 'peculiarity.permanence.name'
			},
			ecology: {
				field: 'peculiarity.ecology.name'
			},
			trophicRegime: {
				field: 'peculiarity.trophicRegime.name'
			},
			interest: {
				field: 'peculiarity.interest.name'
			},
			canaryProtection: {
				field: 'peculiarity.canaryProtection.name'
			},
			spainProtection: {
				field: 'peculiarity.spainProtection.name'
			},
			euProtection: {
				field: 'peculiarity.euProtection.name'
			}
		},
		timeSeriesStations: {
			properties: {
				field: 'properties.measurements.parameter.name',
				nested: 'properties.measurements'
			}
		},
		unit: {
			unitType: {
				field: 'unitType.name'
			}
		}
	};

	retObj.returnFields = {
		activity: [
			'accessibility', 'activityCategory', 'activityType', 'code', 'endDate', 'id', 'name', 'resources',
			'starred', 'startDate', 'themeInspire'
		],
		document: ['id', 'title', 'author', 'year', 'documentType', 'language', 'url'],
		organisation: ['id', 'name', 'acronym', 'logo', 'organisationType', 'webpage'],
		program: ['id', 'name', 'code', 'endDate'],
		project: ['accessibility', 'id', 'name', 'code', 'endDate', 'projectGroup'],
		species: [
			'aphia', 'authorship', 'commonName', 'groupIcon', 'id', 'peculiarity.popularNames', 'scientificName',
			'status'
		],
		taxonsTree: ['scientificName', 'rank', 'path', 'leaves'],
		timeSeriesStationsList: [
			'properties.activityId', 'properties.site.path', 'properties.site.name', 'properties.site.code',
			'properties.site.id', 'properties.measurements.parameter.id', 'properties.measurements.parameter.name',
			'properties.measurements.unit.id', 'properties.measurements.unit.name',
			'properties.measurements.dataDefinition.id', 'properties.measurements.dataDefinition.z'
		],
		timeSeriesStationsMap: ['geometry']
	};

	retObj.outerPaths = [
		'login',
		'register',
		'recover-password',
		'terms-and-conditions',
		'what-is-redmic',
		'confirm-recover-password',
		'feedback'
	];

	retObj.isOuterPath = function(path) {

		if (!path || typeof path !== 'string') {
			return false;
		}

		if (this.outerPaths.indexOf(path) >= 0) {
			return true;
		}

		var pathSeparator = '/',
			pathSplitted = path.split(pathSeparator),
			ancestorPath = pathSplitted[0];

		return this.outerPaths.indexOf(ancestorPath) !== -1;
	};

	retObj.getEnvVariableValue = function(variableName) {

		var variableValue;

		try {
			variableValue = window[variableName];
		} catch(e) {
			console.warn('Tried to get undefined global variable "%s"', variableName);
			variableValue = '';
		}

		return variableValue;
	};

	retObj.getServiceUrl = function(serviceName) {

		if (!serviceName || !serviceName.length) {
			return;
		}

		var apiUrl = retObj.getEnvVariableValue('envApiUrl');

		// TODO esto es necesario hasta que todos los lang.replace de rutas se centralicen y se puedan devolver como dfd
		var undefinedIndex = serviceName.indexOf('undefined');
		if (undefinedIndex !== -1) {
			console.error('Service URL "%s" contains "undefined", variable replacement went wrong', serviceName);
			if (undefinedIndex === 0) {
				console.error('Trying to replace "undefined" with API URL..');
				return serviceName.replace('undefined', apiUrl);
			}
		}

		return serviceName.replace('{apiUrl}', apiUrl);
	};

	return retObj;
});
