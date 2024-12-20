define([], function() {
	//	summary:
	//		Configuraciones y valores globales.

	var retObj = {
		'siteKeyReCaptcha': '6LfA6_0SAAAAACT3i8poH1NqztZCtIW1OahT0cXs',
		'siteKeyForDebugReCaptcha': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		'googleAnalyticsId': 'G-J753HC86F0'
	};

	retObj.viewPaths = {
		'activityCatalog': '/catalog/activity-catalog',
		'activityDetails': '/catalog/activity-info/{id}',
		'activityAdd': '/admin/activity-add/{id}',
		'activityEdit': '/admin/activity-edit/{id}',
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
		'animalAdd': '/admin/animal-add/{id}',
		'animalEdit': '/admin/animal-edit/{id}',
		'bibliography': '/bibliography',
		'bibliographyDetails': '/bibliography/document-info/{id}',
		'bibliographyAdd': '/admin/document-add/{id}',
		'bibliographyEdit': '/admin/document-edit/{id}',
		'bibliographyLoad': '/admin/document/load',
		'conditionAdd': '/admin/condition-add/{id}',
		'conditionEdit': '/admin/condition-edit/{id}',
		'contactDetails': '/admin/contact-info/{id}',
		'contactAdd': '/admin/contact-add/{id}',
		'contactEdit': '/admin/contact-edit/{id}',
		'contact': '/admin/contact',
		'dataDefinition': '/admin/data-definition',
		'dataDefinitionAdd': '/admin/data-definition-add/{id}',
		'dataDefinitionEdit': '/admin/data-definition-edit/{id}',
		'deviceAdd': '/admin/device-add/{id}',
		'deviceEdit': '/admin/device-edit/{id}',
		'metricsDefinitionAdd': '/admin/metrics-definition-add/{id}',
		'metricsDefinitionEdit': '/admin/metrics-definition-edit/{id}',
		'misidentificationAdd': '/admin/misidentification-add/{id}',
		'misidentificationEdit': '/admin/misidentification-edit/{id}',
		'misidentification': '/taxons/misidentification',
		'organisationCatalog': '/catalog/organisation-catalog',
		'organisationDetails': '/catalog/organisation-info/{id}',
		'organisationAdd': '/admin/organisation-add/{id}',
		'organisationEdit': '/admin/organisation-edit/{id}',
		'parameterAdd': '/admin/parameter-add/{id}',
		'parameterEdit': '/admin/parameter-edit/{id}',
		'platformCatalog': '/catalog/platform-catalog',
		'platformDetails': '/catalog/platform-info/{id}',
		'platformAdd': '/admin/platform-add/{id}',
		'platformEdit': '/admin/platform-edit/{id}',
		'programCatalog': '/catalog/program-catalog',
		'programDetails': '/catalog/program-info/{id}',
		'programAdd': '/admin/program-add/{id}',
		'programEdit': '/admin/program-edit/{id}',
		'projectCatalog': '/catalog/project-catalog',
		'projectDetails': '/catalog/project-info/{id}',
		'projectAdd': '/admin/project-add/{id}',
		'projectEdit': '/admin/project-edit/{id}',

		'realTimeDashboard': '/viewer/real-time-dashboard/{uuid}',

		'ogcServiceCatalog': '/service-ogc-catalog',
		'ogcServiceDetails': '/service-ogc-catalog/service-ogc-info/{id}',
		'ogcServiceEdit': '/maintenance/service-ogc-edit/{id}',
		'speciesCatalog': '/catalog/species-catalog',
		'speciesDetails': '/catalog/species-info/{id}',
		'speciesAdd': '/admin/species-add/{id}',
		'speciesEdit': '/admin/species-edit/{id}',
		'unitAdd': '/admin/unit-add/{id}',
		'unitEdit': '/admin/unit-edit/{id}'
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
		'misidentification': baseUri + 'taxons/misidentifications',
		'species': baseUri + 'taxons/species',
		'speciesLocation': baseUri + 'taxons/species/{id}/locations',
		'taxonAncestors': baseUri + 'taxons/{path}/ancestors',
		'documentByMisidentification': baseUri + 'taxons/misidentifications/{id}/documents',
		'activitiesBySpecies': baseUri + 'taxons/species/{id}/activities',
		'documentsBySpecies': baseUri + 'taxons/species/{id}/documents',
		'worms': baseUri + 'taxons/worms',
		'wormsToRedmic': baseUri + 'taxons/worms/convert2redmic',
		'wormsUpdate': baseUri + 'taxons/worms/update',

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
		'elementTracking': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}',
		'trackElementTracking': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}/track',
		'pointTrackElementTracking': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}/track/{id}',
		'pointTrackingCluster': baseUri + 'activities/{activityid}/tracking/elements/{elementuuid}/track/cluster',
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
				terms: {
					field: 'themeInspire.name'
				}
			},
			activityType: {
				terms: {
					field: 'activityType.name'
				}
			},
			territorialScope: {
				terms: {
					field: 'scope.name'
				}
			}
		},
		activityType: {
			activityField: {
				terms: {
					field: 'activityField.name'
				}
			}
		},
		animal: {
			sex: {
				terms: {
					field: 'sex.name'
				}
			},
			lifeStage: {
				terms: {
					field: 'lifeStage.name'
				}
			}
		},
		atlasLayer: {
			protocols: {
				terms: {
					field: 'protocols.type',
					nested: 'protocols'
				}
			},
			themeInspire: {
				terms: {
					field: 'themeInspire.name'
				}
			},
			keywords: {
				terms: {
					field: 'keywords'
				}
			}
		},
		contact: {
			organisation: {
				terms: {
					field: 'affiliation.name'
				}
			}
		},
		device: {
			deviceType: {
				terms: {
					field: 'deviceType.name'
				}
			}
		},
		document: {
			documentType: {
				terms: {
					field: 'documentType.name'
				}
			},
			language: {
				terms: {
					field: 'language'
				}
			}
		},
		metricsDefinition: {
			metricGroup: {
				terms: {
					field: 'metricGroup.name'
				}
			}
		},
		organisation: {
			organisationType: {
				terms: {
					field: 'organisationType.name'
				}
			}
		},
		parameter: {
			parameterType: {
				terms: {
					field: 'parameterType.name'
				}
			}
		},
		platform: {
			platformType: {
				terms: {
					field: 'platformType.name'
				}
			}
		},
		program: {
			territorialScope: {
				terms: {
					field: 'scope.name'
				}
			}
		},
		project: {
			projectGroup: {
				terms: {
					field: 'projectGroup.name'
				}
			},
			territorialScope: {
				terms: {
					field: 'scope.name'
				}
			}
		},
		species: {
			status: {
				terms: {
					field: 'status.name'
				}
			},
			origin: {
				terms: {
					field: 'peculiarity.origin.name'
				}
			},
			endemicity: {
				terms: {
					field: 'peculiarity.endemicity.name'
				}
			},
			permanence: {
				terms: {
					field: 'peculiarity.permanence.name'
				}
			},
			ecology: {
				terms: {
					field: 'peculiarity.ecology.name'
				}
			},
			trophicRegime: {
				terms: {
					field: 'peculiarity.trophicRegime.name'
				}
			},
			interest: {
				terms: {
					field: 'peculiarity.interest.name'
				}
			},
			canaryProtection: {
				terms: {
					field: 'peculiarity.canaryProtection.name'
				}
			},
			spainProtection: {
				terms: {
					field: 'peculiarity.spainProtection.name'
				}
			},
			euProtection: {
				terms: {
					field: 'peculiarity.euProtection.name'
				}
			}
		},
		taxons: {
			status: {
				terms: {
					field: 'status.name'
				}
			}
		},
		timeSeriesStations: {
			properties: {
				terms: {
					field: 'properties.measurements.parameter.name',
					nested: 'properties.measurements'
				}
			}
		},
		unit: {
			unitType: {
				terms: {
					field: 'unitType.name'
				}
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
