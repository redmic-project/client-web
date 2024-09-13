define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/maintenance/domain/definition/Accessibility'
	, 'src/maintenance/domain/definition/ActivityFields'
	, 'src/maintenance/domain/definition/ActivityTypes'
	, 'src/maintenance/domain/definition/AreaTypes'
	, 'src/maintenance/domain/definition/AttributeTypes'
	, 'src/maintenance/domain/definition/CanaryProtection'
	, 'src/maintenance/domain/definition/CensingStatus'
	, 'src/maintenance/domain/definition/Confidence'
	, 'src/maintenance/domain/definition/ContactRoles'
	, 'src/maintenance/domain/definition/Countries'
	, 'src/maintenance/domain/definition/Destiny'
	, 'src/maintenance/domain/definition/DeviceTypes'
	, 'src/maintenance/domain/definition/DocumentTypes'
	, 'src/maintenance/domain/definition/Ecology'
	, 'src/maintenance/domain/definition/Endemicity'
	, 'src/maintenance/domain/definition/Ending'
	, 'src/maintenance/domain/definition/EUProtection'
	, 'src/maintenance/domain/definition/EventGroups'
	, 'src/maintenance/domain/definition/InfrastructureType'
	, 'src/maintenance/domain/definition/InspireThemes'
	, 'src/maintenance/domain/definition/Interest'
	, 'src/maintenance/domain/definition/LifeStages'
	, 'src/maintenance/domain/definition/LineTypes'
	, 'src/maintenance/domain/definition/MeshTypes'
	, 'src/maintenance/domain/definition/MetricGroups'
	, 'src/maintenance/domain/definition/MetricsDefinitions'
	, 'src/maintenance/domain/definition/ObjectTypes'
	, 'src/maintenance/domain/definition/ObservationTypes'
	, 'src/maintenance/domain/definition/OrganisationRoles'
	, 'src/maintenance/domain/definition/OrganisationTypes'
	, 'src/maintenance/domain/definition/Origin'
	, 'src/maintenance/domain/definition/Parameters'
	, 'src/maintenance/domain/definition/ParameterTypes'
	, 'src/maintenance/domain/definition/Permanence'
	, 'src/maintenance/domain/definition/PlatformTypes'
	, 'src/maintenance/domain/definition/ProjectGroups'
	, 'src/maintenance/domain/definition/Rank'
	, 'src/maintenance/domain/definition/RasterTypes'
	, 'src/maintenance/domain/definition/RecordingTypes'
	, 'src/maintenance/domain/definition/SampleTypes'
	, 'src/maintenance/domain/definition/Scopes'
	, 'src/maintenance/domain/definition/SeaConditions'
	, 'src/maintenance/domain/definition/Sex'
	, 'src/maintenance/domain/definition/ShorelineTypes'
	, 'src/maintenance/domain/definition/SpainProtection'
	, 'src/maintenance/domain/definition/Status'
	, 'src/maintenance/domain/definition/ThematicType'
	, 'src/maintenance/domain/definition/ToponymTypes'
	, 'src/maintenance/domain/definition/TrophicRegime'
	, 'src/maintenance/domain/definition/Units'
	, 'src/maintenance/domain/definition/UnitTypes'
], function(
	declare
	, lang
	, Deferred
	, _Module
	, _Show
	, AccessibilityDomainDefinition
	, ActivityFieldsDomainDefinition
	, ActivityTypesDomainDefinition
	, AreaTypesDomainDefinition
	, AttributeTypesDomainDefinition
	, CanaryProtectionDomainDefinition
	, CensingStatusDomainDefinition
	, ConfidenceDomainDefinition
	, ContactRolesDomainDefinition
	, CountriesDomainDefinition
	, DestinyDomainDefinition
	, DeviceTypesDomainDefinition
	, DocumentTypesDomainDefinition
	, EcologyDomainDefinition
	, EndemicityDomainDefinition
	, EndingDomainDefinition
	, EUProtectionDomainDefinition
	, EventGroupsDomainDefinition
	, InfrastructureTypeDomainDefinition
	, InspireThemesDomainDefinition
	, InterestDomainDefinition
	, LifeStagesDomainDefinition
	, LineTypesDomainDefinition
	, MeshTypesDomainDefinition
	, MetricGroupsDomainDefinition
	, MetricsDefinitionsDomainDefinition
	, ObjectTypesDomainDefinition
	, ObservationTypesDomainDefinition
	, OrganisationRolesDomainDefinition
	, OrganisationTypesDomainDefinition
	, OriginDomainDefinition
	, ParametersDomainDefinition
	, ParameterTypesDomainDefinition
	, PermanenceDomainDefinition
	, PlatformTypesDomainDefinition
	, ProjectGroupsDomainDefinition
	, RankDomainDefinition
	, RasterTypesDomainDefinition
	, RecordingTypesDomainDefinition
	, SampleTypesDomainDefinition
	, ScopesDomainDefinition
	, SeaConditionsDomainDefinition
	, SexDomainDefinition
	, ShorelineTypesDomainDefinition
	, SpainProtectionDomainDefinition
	, StatusDomainDefinition
	, ThematicTypeDomainDefinition
	, ToponymTypesDomainDefinition
	, TrophicRegimeDomainDefinition
	, UnitsDomainDefinition
	, UnitTypesDomainDefinition
) {

	return declare([_Module, _Show], {

		//	summary:
		// 		Vista común de mantenimiento de dominio.

		constructor: function(args) {

			this.config = {
				ownChannel: 'domainMaintenance',
				_domainDefinitionByName: {
					'accessibility': AccessibilityDomainDefinition
					, 'activity-fields': ActivityFieldsDomainDefinition
					, 'activity-types': ActivityTypesDomainDefinition
					, '': AreaTypesDomainDefinition // TODO no se ha enlazado
					, 'attribute-types': AttributeTypesDomainDefinition
					, 'canary-protection': CanaryProtectionDomainDefinition
					, 'censusing-status': CensingStatusDomainDefinition
					, 'confidence': ConfidenceDomainDefinition
					, 'contact-roles': ContactRolesDomainDefinition
					, 'countries': CountriesDomainDefinition
					, 'destiny': DestinyDomainDefinition
					, 'device-types': DeviceTypesDomainDefinition
					, 'document-types': DocumentTypesDomainDefinition
					, 'ecology': EcologyDomainDefinition
					, 'endemicity': EndemicityDomainDefinition
					, 'ending': EndingDomainDefinition
					, 'eu-protection': EUProtectionDomainDefinition
					, '': EventGroupsDomainDefinition // TODO no se ha enlazado
					, 'infrastructure-type': InfrastructureTypeDomainDefinition
					, 'inspire-themes': InspireThemesDomainDefinition
					, 'interest': InterestDomainDefinition
					, 'life-stages': LifeStagesDomainDefinition
					, 'line-types': LineTypesDomainDefinition
					, 'mesh-types': MeshTypesDomainDefinition
					, '': MetricGroupsDomainDefinition // TODO no se ha enlazado
					, '': MetricsDefinitionsDomainDefinition // TODO no se ha enlazado
					, 'object-types': ObjectTypesDomainDefinition
					, '': ObservationTypesDomainDefinition // TODO no se ha enlazado
					, 'organisation-roles': OrganisationRolesDomainDefinition
					, 'organisation-types': OrganisationTypesDomainDefinition
					, 'origin': OriginDomainDefinition
					, 'parameters': ParametersDomainDefinition
					, 'parameter-types': ParameterTypesDomainDefinition
					, 'permanence': PermanenceDomainDefinition
					, 'platform-types': PlatformTypesDomainDefinition
					, 'project-groups': ProjectGroupsDomainDefinition
					, 'rank': RankDomainDefinition
					, '': RasterTypesDomainDefinition // TODO no se ha enlazado
					, '': RecordingTypesDomainDefinition // TODO no se ha enlazado
					, 'sample-types': SampleTypesDomainDefinition
					, 'scopes': ScopesDomainDefinition
					, 'sea-conditions': SeaConditionsDomainDefinition
					, 'sex': SexDomainDefinition
					, '': ShorelineTypesDomainDefinition // TODO no se ha enlazado
					, 'spain-protection': SpainProtectionDomainDefinition
					, 'status': StatusDomainDefinition
					, 'thematic-type': ThematicTypeDomainDefinition
					, 'toponym-types': ToponymTypesDomainDefinition // TODO no funciona la petición hacia api
					, 'trophic-regime': TrophicRegimeDomainDefinition
					, 'units': UnitsDomainDefinition
					, 'unit-types': UnitTypesDomainDefinition
				}
			};

			lang.mixin(this, this.config, args);
		},

		_beforeShow: function(req) {

			if (this._domainInstanceDfd && !this._domainInstanceDfd.isFulfilled()) {
				this._domainInstanceDfd.reject();
			}

			this._domainInstanceDfd = new Deferred();

			var pathSplitted = globalThis.location.pathname.split('/'),
				domainName = pathSplitted.pop();

			if (this._domainInstance) {
				this._publish(this._domainInstance.getChannel('DESTROY'));
			}

			this._createDomainInstance(domainName, req.node);

			return this._domainInstanceDfd;
		},

		_createDomainInstance: function(domainName, parentNode) {

			var DomainDefinition = this._getDefinitionForSpecificDomain(domainName);

			this._domainInstance = new DomainDefinition({
				parentChannel: this.getChannel()
			});

			this._once(this._domainInstance.getChannel('SHOWN'), lang.hitch(this, function() {

				this._domainInstanceDfd.resolve();
			}));

			this._publish(this._domainInstance.getChannel('SHOW'), {
				node: parentNode
			});
		},

		_getDefinitionForSpecificDomain: function(domainName) {

			var domainDefinition = this._domainDefinitionByName[domainName];

			if (!domainDefinition) {
				console.error('Tried to load definition for unknown domain "%s"', domainName);
			}

			return domainDefinition;
		},

		_getNodeToShow: function() {

			return this._domainInstance._getNodeToShow();
		}
	});
});
