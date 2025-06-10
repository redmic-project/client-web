define([], function() {
	//	summary:
	//		Configuraciones y valores globales.

	var retObj = {
		'siteKeyReCaptcha': '6LefmUIUAAAAAA2BttWmfpK5lYMn5Bl53KFDdzPe',
		'siteKeyForDebugReCaptcha': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		'googleTagManagerId': 'GTM-PK5MH63C',
		'googleTagManagerDevId': 'GTM-WJZRQZLZ'
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

	var baseUri = '{apiUrl}/',
		baseMediastorageUploads = baseUri + 'mediastorage/uploads/';

	retObj.apiUrlVariable = baseUri.slice(0, -1);

	retObj.services = {
		'grafcan': 'https://visor.grafcan.es/busquedas/toponimo',
		'socket': baseUri + 'socket',
		'document': baseUri + 'documents',
		'accessibility': baseUri + 'accessibilities',
		'activity': baseUri + 'activities',
		'activityResource': baseUri + 'activities/resources',
		'activityProject': baseUri + 'projects/{id}/activities',
		'activityField': baseUri + 'activityfields',
		'activityType': baseUri + 'activitytypes',
		'activityCategoriesByActivityType': baseUri + 'activitytypes/{id}/activitycategories',
		'affiliation': baseUri + 'organisations',
		'animal': baseUri + 'animals',
		'areaType': baseUri + 'areatypes',
		'themeInspire': baseUri + 'atlas/view/themeinspire',
		'themeInspireEdition': baseUri + 'atlas/commands/themeinspire',
		'toponymType': baseUri + 'toponymtypes',
		'attributeType': baseUri + 'attributetypes',
		'canaryProtection': baseUri + 'canaryprotections',
		'trophicRegime': baseUri + 'trophicregimes',
		'censingStatus': baseUri + 'censingstatuses',
		'citationByDocuments': baseUri + 'documents/{id}/citations',
		'calibrations': baseUri + 'calibrations',
		'citationAll': baseUri + 'citations',
		'citationByActivity': baseUri + 'activities/{id}/citations',
		'condition': baseUri + 'conditions',
		'confidence': baseUri + 'confidences',
		'contact': baseUri + 'contacts',
		'contactRole': baseUri + 'contactroles',
		'country': baseUri + 'countries',
		'dataDefinition': baseUri + 'datadefinitions',
		'destiny': baseUri + 'destinies',
		'device': baseUri + 'devices',
		'deviceType': baseUri + 'devicetypes',
		'distribution': baseUri + 'distributions',
		'documentType': baseUri + 'documenttypes',
		'downloadFile': baseUri + 'mediastorage/download',
		'ecology': baseUri + 'ecologies',
		'endemicity': baseUri + 'endemicities',
		'ending': baseUri + 'endings',
		'euProtection': baseUri + 'euprotections',
		'eventGroup': baseUri + 'eventgroups',

		'taxons': baseUri + 'taxons',
		'class': baseUri + 'taxons/classes',
		'family': baseUri + 'taxons/families',
		'phylum': baseUri + 'taxons/phylums',
		'genus': baseUri + 'taxons/genuses',
		'kingdom': baseUri + 'taxons/kingdoms',
		'order': baseUri + 'taxons/orders',
		'subphylum': baseUri + 'taxons/subphylums',
		'status': baseUri + 'taxons/statuses',
		'species': baseUri + 'taxons/species',
		'speciesLocation': baseUri + 'taxons/species/{id}/locations',
		'taxonAncestors': baseUri + 'taxons/{path}/ancestors',
		'documentByMisidentification': baseUri + 'taxons/misidentifications/{id}/documents',
		'activitiesBySpecies': baseUri + 'taxons/species/{id}/activities',
		'documentsBySpecies': baseUri + 'taxons/species/{id}/documents',
		'worms': baseUri + 'taxons/worms',
		'wormsToRedmic': baseUri + 'taxons/worms/convert2redmic',

		'users': baseUri + 'user',
		'accountData': baseUri + 'user/accountData',
		'feedback': baseUri + 'user/feedback',
		'register': baseUri + 'user/register',
		'role': baseUri + 'user/roles',
		'userSector': baseUri + 'user/sectors',
		'profile': baseUri + 'user/profile',
		'activateAccount': baseUri + 'user/activateAccount',
		'changeUserSector': baseUri + 'user/profile/changeSector',
		'changeEmail': baseUri + 'user/profile/changeEmail',
		'resettingRequest': baseUri + 'user/profile/resettingRequest',
		'resettingSetPassword': baseUri + 'user/profile/resettingSetPassword',
		'changePassword': baseUri + 'user/profile/changePassword',
		'changeName': baseUri + 'user/profile/changeName',
		'changeUserImage': baseUri + 'user/profile/changeImage',
		'getSupersetToken': baseUri + 'user/superset/get-token',

		'uploadUsers': baseMediastorageUploads + 'users',
		'uploadContacts': baseMediastorageUploads + 'contacts',
		'uploadOrganisations': baseMediastorageUploads + 'organisations',
		'uploadPlatforms': baseMediastorageUploads + 'platforms',
		'uploadSpecies': baseMediastorageUploads + 'species',
		'uploadAnimals': baseMediastorageUploads + 'animals',
		'uploadDocuments': baseMediastorageUploads + 'documents',
		'uploadData': baseMediastorageUploads + 'data',

		'infrastructureByActivity': baseUri + 'activities/{id}/infrastructures',
		'infrastructureType': baseUri + 'infrastructuretypes',
		'interest': baseUri + 'interests',
		'intervalUnit': baseUri + 'intervalunits',
		'lifeStage': baseUri + 'lifestages',
		'lineType': baseUri + 'linetypes',
		'meshType': baseUri + 'meshtypes',
		'metricGroup': baseUri + 'metricgroups',
		'metricsDefinition': baseUri + 'metricdefinitions',

		'module': baseUri + 'modules',
		'objectGroup': baseUri + 'objectgroups',
		'objectType': baseUri + 'objecttypes',
		'observationType': baseUri + 'observationtypes',
		'organisation': baseUri + 'organisations',
		'organisationRole': baseUri + 'organisationroles',
		'organisationType': baseUri + 'organisationtypes',
		'origin': baseUri + 'origins',
		'parameter': baseUri + 'parameters',
		'parameterType': baseUri + 'parametertypes',
		'permanence': baseUri + 'permanences',
		'platform': baseUri + 'platforms',
		'platformType': baseUri + 'platformtypes',
		'animalTracking': baseUri + 'animaltracking',
		'pointTrackingActivities': baseUri + 'tracking/activities',
		'trackingActivity': baseUri + 'activities/{id}/tracking',
		'elementsTrackingActivity': baseUri + 'activities/{id}/tracking/elements',
		'privateElementsTrackingActivity': baseUri + 'private/activities/{id}/tracking/elements',
		'elementTracking': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}',
		'trackElementTracking': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}/track',
		'pointTrackElementTracking': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}/track/{id}',
		'pointTrackingCluster': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}/track/cluster',
		'privatePointTrackingCluster': baseUri + 'private/activities/{activityid}/tracking/elements/{elementuuid}/track/cluster',
		'animalTrackingActivity': baseUri + 'activities/{activityid}/animaltracking',
		'platformTrackingActivity': baseUri + 'activities/{activityid}/platformtracking',
		'pointType': baseUri + 'pointtypes',
		'program': baseUri + 'programs',
		'project': baseUri + 'projects',
		'projectProgram': baseUri + 'programs/{id}/projects',
		'projectGroup': baseUri + 'projectgroups',
		'rank': baseUri + 'ranks',
		'rasterType': baseUri + 'rastertypes',
		'recordingType': baseUri + 'recordingtypes',
		'sampleType': baseUri + 'sampletypes',
		'scope': baseUri + 'scopes',
		'seaCondition': baseUri + 'seaconditions',
		'sex': baseUri + 'sexes',
		'shorelineType': baseUri + 'shorelinetypes',
		'spainProtection': baseUri + 'spainprotections',

		'activityAncestors': baseUri + 'activities/{path}/ancestors',
		'speciesValidity': baseUri + 'speciesvalidities',
		'themes': baseUri + 'themes',
		'thematicType': baseUri + 'thematictypes',
		'getToken': '/oauth/token',
		'getExternalConfig': '/config',
		'logout': baseUri + 'oauth/token/revoke',
		'unit': baseUri + 'units',
		'unitType': baseUri + 'unittypes',

		'timeSeries': baseUri + 'timeseries',
		'timeSeriesTemporalData': baseUri + 'time-series/view/temporaldata',
		'timeSeriesWindRose': baseUri + 'time-series/view/activities/{id}/windrose',

		'activityOrganisations': baseUri + 'organisations/{id}/activities',
		'activityAnimals': baseUri + 'platforms/{id}/activities', // TODO cambiar al servicio bueno cuando exista
		'activityPlatforms': baseUri + 'platforms/{id}/activities',
		'activityDocuments': baseUri + 'documents/{id}/activities',
		'activityContacts': baseUri + 'contacts/{id}/activities',

		'atlasLayer': baseUri + 'atlas/view/layer',
		'atlasLayerEdition': baseUri + 'atlas/commands/layer',
		'atlasLayerSelection': baseUri + 'atlas/{endpoint}/layer/settings',
		'atlasLayerRefresh': baseUri + 'atlas/commands/layer/refresh',
		'atlasLayerDiscovery': baseUri + 'atlas/commands/discover-layers',
		'atlasCategory': baseUri + 'atlas/view/category',
		'atlasCategoryEdition': baseUri + 'atlas/commands/category',

		'statistics': baseUri + 'statistics',
		'administrativeStatistics': baseUri + 'statistics/administrative',
		'qFlag': baseUri + 'qflags',
		'vFlag': baseUri + 'vflags',

		'timeSeriesActivities': baseUri + 'timeseries/activities',
		'activityTimeSeriesStations': baseUri + 'activities/{activityid}/timeseriesstations',
		'activityObservationSeriesStations': baseUri + 'private/activities/{id}/observationseriesstations',
		'observationSeries': baseUri + 'private/observationseries',
		'timeSeriesStations': baseUri + 'surveystations',
		'surveyStationsTimeSeries': baseUri + 'datadefinitions/{datadefinitionid}/timeseries',

		'activityObjectCollectingSeriesStations': baseUri +
			'activities/{activityid}/objectcollectingseriesstations',

		'objectCollectingSeries': baseUri + 'time-series/view/objectcollectingseries',
		'objectCollectingSeriesByDataDefinition': baseUri +
			'datadefinitions/{datadefinitionid}/objectcollectingseries',

		'objectCollectingSeriesActivities': baseUri + 'objectcollectingseries/activities',
		'objectCollectingSeriesTemporalData': baseUri + 'time-series/view/objectcollectingseries/temporaldata',
		'objectCollectingSeriesClassification': baseUri + 'time-series/view/objectcollectingseries/classification',
		'objectCollectingSeriesClassificationList': baseUri + 'time-series/view/objectcollectingseries/classificationlist',
		'convertShapefileToGeoJSON': baseUri + 'utils/geo/convert2geojson',

		'attributesByInfrastructure': baseUri + 'activities/{activityid}/infrastructures/{id}/attributes',

		'areasByActivity': baseUri + 'activities/{activityid}/areas',
		'areasPropertiesByActivity': baseUri + 'activities/{activityid}/areas/properties',

		'areaClassifications': baseUri + 'areaclassifications',
		'speciesRanks': baseUri + 'ranks/speciesranks',


		//	TODO estas cambiarán a plural en el caso en que se usen para consultar/editar los registros,
		//	por ahora solo se usan para obtener los jsonschema asociados
		//	***********************************************************************************
		'specimenTag': baseUri + 'specimentag',
		'recovery': baseUri + 'recovery',
		'describeSite': baseUri + 'fixedsurvey',
		'measurement': baseUri + 'measurement',
		'organisationContactRole': baseUri + 'organisationcontactrole',
		'organisationrole': baseUri + 'organisationrole',
		'platformContactRole': baseUri + 'platformcontactrole',
		'calibration': baseUri + 'calibration'
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
		observationSeries: {
			animal: {
				field: 'observation.animal.name',
				minCount: 1
			},
			species: {
				field: 'observation.taxonomy.scientificName',
				minCount: 1
			},
			organisation: {
				field: 'observation.organisation.name',
				minCount: 1
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
		timeSeriesStationsMap: ['geometry'],
		observationSeries: [
			'date', 'remark', 'observation.note', 'observation.animal.id', 'observation.animal.name',
			'observation.taxonomy.id', 'observation.taxonomy.scientificName', 'observation.device.id',
			'observation.device.name', 'observation.device.model', 'observation.organisation.id',
			'observation.organisation.name'
		]
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
