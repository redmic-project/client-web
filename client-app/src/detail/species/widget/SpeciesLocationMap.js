define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignFullSizeLayout'
	, 'src/redmicConfig'
	, 'templates/SpeciesDistributionPopup'
	, 'templates/TrackingSecondaryList'
], function(
	declare
	, lang
	, Deferred
	, _Module
	, _Show
	, _Store
	, _AddMapLayerComponent
	, _MapDesignFullSizeLayout
	, redmicConfig
	, SpeciesDistributionPopup
	, TrackingSecondaryList
) {

	return declare([_Module, _Show, _Store, _MapDesignFullSizeLayout, _AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar en un mapa las localizaciones de una especie.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'speciesLocationMap',
				enabledMapLayerExtensions: {
					requestData: true,
					listenBounds: true,
					listenZoom: true,
					radius: true
				},
				target: redmicConfig.services.speciesLocation
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('mapLayerConfig', {
				targetPathParams: {
					id: this.pathVariableId
				}
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('ADD_REQUEST_PARAMS', {
				target: this.target,
				params: {
					query: {
						returnFields: ['geometry', 'id', 'uuid', 'properties.collect.radius']
					},
					sharedParams: true
				}
			});
		},

		_onMeOrAncestorShown: function() {

			if (!this._getPreviouslyShown()) {
				return;
			}

			this._updateRequestParams();
		},

		_updateRequestParams: function() {

			const mapLayerInstance = this.getComponentInstance('mapLayer');

			this._publish(mapLayerInstance.getChannel('SET_PROPS'), {
				targetPathParams: {
					id: this.pathVariableId
				}
			});
		},

		_getMarkerCategory: function(feature) {

			if (!feature?._meta?.category) {
				return 1;
			}

			if (feature._meta.category === 'ci') {
				return 0;
			}
		},

		_getPopupContent: function(data) {

			const feature = data.feature,
				category = data.category;

			let templatePopup, targetPopup, parseData;

			if (category === 0) {
				templatePopup = SpeciesDistributionPopup;
				targetPopup = redmicConfig.services.citationInfo;
				parseData = this._parseCitationData;
			} else {
				templatePopup = TrackingSecondaryList;
				targetPopup = redmicConfig.services.animalTracking;
				parseData = this._parseLocationData;
			}

			var dfd = new Deferred();

			this._once(this._buildChannel(this.storeChannel, 'ITEM_AVAILABLE'), lang.hitch(this, parseData, {
				dfd, templatePopup
			}));

			this._emitEvt('GET', {
				target: targetPopup,
				requesterId: this.getOwnChannel(),
				id: feature.uuid
			});

			return dfd;
		},

		_parseCitationData: function(args, resWrapper) {

			const feature = resWrapper.res.data,
				templatePopup = args.templatePopup,
				dfd = args.dfd;

			if (feature.properties?.activityId) {
				this._once(this._buildChannel(this.storeChannel, 'ITEM_AVAILABLE'),
					lang.hitch(this, this._parseActivityPopupData, {feature, templatePopup, dfd}));

				this._emitEvt('GET', {
					target: redmicConfig.services.activity,
					requesterId: this.getOwnChannel(),
					id: feature.properties.activityId
				});
			} else {
				dfd.resolve(templatePopup({
					feature,
					i18n: this.i18n
				}));
			}
		},

		_parseActivityPopupData: function(args, resWrapper) {

			const feature = args.feature,
				templatePopup = args.templatePopup,
				dfd = args.dfd;

			const activityData = resWrapper.res.data;

			feature.properties.activity = activityData;

			dfd.resolve(templatePopup({
				feature,
				i18n: this.i18n
			}));
		},

		_parseLocationData: function(args, resWrapper) {

			const feature = resWrapper.res.data;

			const templatePopup = args.templatePopup,
				dfd = args.dfd;

			dfd.resolve(templatePopup({
				data: feature,
				shownOption: {animal: true},
				i18n: this.i18n
			}));
		}
	});
});
