define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignController'
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
	, _MapDesignController
	, _MapDesignFullSizeLayout
	, redmicConfig
	, SpeciesDistributionPopup
	, TrackingSecondaryList
) {

	return declare([_Module, _Show, _Store, _MapDesignController, _MapDesignFullSizeLayout, _AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar en un mapa las localizaciones de una especie.

		constructor: function(args) {

			const defaultConfig = {
				ownChannel: 'speciesLocationMap',
				enabledMapLayerExtensions: {
					filter: true,
					listenBounds: true,
					listenZoom: true,
					radius: true
				},
				_dataTarget: redmicConfig.services.speciesLocation
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('mapLayerConfig', {
				filterConfig: {
					initQuery: {
						returnFields: ['geometry', 'id', 'uuid', 'properties.collect.radius']
					}
				}
			});
		},

		_onMeOrAncestorShown: function() {

			const replacedTarget = this._getTargetWithVariableReplaced();

			this._updateComponentTargetValues(replacedTarget);
			this._requestDataFromReplacedTarget(replacedTarget);
		},

		_getTargetWithVariableReplaced: function() {

			const replaceObj = {
				id: this.pathVariableId
			};

			return lang.replace(this._dataTarget, replaceObj);
		},

		_updateComponentTargetValues: function(replacedTarget) {

			const mapLayerInstance = this.getComponentInstance('mapLayer');

			this._publish(mapLayerInstance.getChannel('CHANGE_TARGET'), {
				target: replacedTarget
			});
		},

		_requestDataFromReplacedTarget: function(replacedTarget) {

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});
		},

		_getMarkerCategory: function(feature) {

			if (feature._meta.category && feature._meta.category == 'ci') {
				return 0;
			} else {
				return 1;
			}
		},

		_getPopupContent: function(data) {

			const feature = data.feature,
				category = data.category;

			let templatePopup, targetPopup, parseData;

			if (category === 0) {
				templatePopup = SpeciesDistributionPopup;
				targetPopup = redmicConfig.services.citationAll;
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

			let feature = args.feature;

			const activityData = resWrapper.res.data,
				templatePopup = args.templatePopup,
				dfd = args.dfd;

			feature.properties.activity = activityData;

			dfd.resolve(templatePopup({
				feature,
				i18n: this.i18n
			}));
		},

		_parseLocationData: function(args, resWrapper) {

			const feature = resWrapper.res.data,
				templatePopup = args.templatePopup,
				dfd = args.dfd;

			dfd.resolve(templatePopup({
				data: feature,
				shownOption: {animal: true},
				i18n: this.i18n
			}));
		}
	});
});
