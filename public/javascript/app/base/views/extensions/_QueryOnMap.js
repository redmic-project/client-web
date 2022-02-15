define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"

	, "templates/AtlasPrimaryList"
	, "templates/AtlasSecondaryList"
	, "templates/AtlasRedpromarSecondaryList"
	, "templates/TrackingPrimaryList"
	, "templates/TrackingSecondaryList"
	, "templates/SpeciesDistributionPrimaryList"
	, "templates/SpeciesDistributionCitation"
], function(
	declare
	, lang
	, aspect

	, AtlasPrimaryList
	, AtlasSecondaryList
	, AtlasRedpromarSecondaryList
	, TrackingPrimaryList
	, TrackingSecondaryList
	, SpeciesDistributionPrimaryList
	, SpeciesDistributionCitation
) {

	return declare(null, {
		//	summary:
		//		Extensión para las vistas con mapa que desean hacer consultas sobre el mismo.
		//	description:
		//		Escucha los clicks del mapa y la información (sobre ese punto) de las capas presentes.
		//		Muestra la información en un popup.


		constructor: function(args) {

			this.config = {
				queryOnMapEvents: {
					HIDE_LAYERS_INFO: "hideLayersInfo",
					ADD_INFO_DATA: "addInfoData",
					ADD_NEW_TEMPLATES: "addNewTemplates",
					SHOW_LAYERS_INFO: "showLayersInfo",
					SET_MAP_QUERYABLE_CURSOR: "setMapQueryableCursor"
				},
				queryOnMapActions: {
					HIDE_LAYERS_INFO: "hideLayersInfo",
					ADD_INFO_DATA: "addInfoData",
					ADD_NEW_TEMPLATES: "addNewTemplates",
					SHOW_LAYERS_INFO: "showLayersInfo"
				},

				layerIdSeparator: "_",
				layerIdPrefix: "layer-",
				layerThemeSeparator: "-",
				typeGroupProperty: "dataType",
				parentTemplateSuffix: "Parent",
				childrenTemplateSuffix: "Children",

				_queryableLayersLoaded: 0,
				_layersWaiting: 0,

				_templatesByTypeGroup: {
					//	Podemos sobreescribir las plantillas genéricas de las capas
					//	de atlas especificando el nombre de la capa completo
					//"el-batimetriaIslasParent": AtlasPrimaryList",
					//"el-batimetriaIslasChildren": AtlasBathymetry",

					"defaultParent": AtlasPrimaryList,
					"defaultChildren": AtlasSecondaryList,

					"trackingParent": TrackingPrimaryList,
					"trackingChildren": TrackingSecondaryList,

					"taxonDistributionParent": SpeciesDistributionPrimaryList,
					"taxonDistributionChildren": {
						"ci": SpeciesDistributionCitation,
						"at": TrackingSecondaryList
					},

					"sd-full_sighting_taxon_yearChildren": AtlasRedpromarSecondaryList,
					"sd-exotic-species-sightingChildren": AtlasRedpromarSecondaryList
				}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixQueryOnMapEventsAndActions));
			aspect.before(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setQueryOnMapOwnCallbacksForEvents));

			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineQueryOnMapSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineQueryOnMapPublications));
		},

		_mixQueryOnMapEventsAndActions: function() {

			lang.mixin(this.events, this.queryOnMapEvents);
			lang.mixin(this.actions, this.queryOnMapActions);

			delete this.queryOnMapEvents;
			delete this.queryOnMapActions;
		},

		_defineQueryOnMapSubscriptions: function() {

			var getMapChannel = this.map ?
				lang.hitch(this.map, this.map.getChannel) :
				this.getMapChannel;

			var options = {
				predicate: lang.hitch(this, this._chkLayerIsQueryable)
			};

			this.subscriptionsConfig.push({
				channel : getMapChannel("MAP_CLICKED"),
				callback: "_subMapClickedQueryOnMap"
			},{
				channel: getMapChannel("LAYER_ADDED_CONFIRMED"),
				callback: "_subLayerAddedQueryOnMap",
				options: options
			},{
				channel: getMapChannel("LAYER_REMOVED_CONFIRMED"),
				callback: "_subLayerRemovedQueryOnMap",
				options: options
			},{
				channel: getMapChannel("LAYER_QUERYING"),
				callback: "_subLayerQueryingQueryOnMap"
			},{
				channel: getMapChannel("LAYER_INFO"),
				callback: "_subLayerInfoQueryOnMap"
			});
		},

		_defineQueryOnMapPublications: function() {

			var getMapChannel = this.map ?
				lang.hitch(this.map, this.map.getChannel) :
				this.getMapChannel;

			this.publicationsConfig.push({
				event: 'HIDE_LAYERS_INFO',
				channel: this.getChannel("HIDE_LAYERS_INFO")
			},{
				event: 'ADD_INFO_DATA',
				channel: this.getChannel("ADD_INFO_DATA")
			},{
				event: 'ADD_NEW_TEMPLATES',
				channel: this.getChannel("ADD_NEW_TEMPLATES")
			},{
				event: 'SHOW_LAYERS_INFO',
				channel: this.getChannel("SHOW_LAYERS_INFO")
			},{
				event: 'SET_MAP_QUERYABLE_CURSOR',
				channel: getMapChannel("SET_QUERYABLE_CURSOR")
			});
		},

		_setQueryOnMapOwnCallbacksForEvents: function() {

			this.on([this.events.HIDE, this.events.ANCESTOR_HIDE],
				lang.hitch(this, this.emit, this.events.HIDE_LAYERS_INFO));
		},

		_chkLayerIsQueryable: function(res) {

			return !!res.queryable;
		},

		_subMapClickedQueryOnMap: function(response) {

			this._emitEvt('HIDE_LAYERS_INFO');

			if (this._queryableLayersLoaded) {
				this._emitEvt('LOADING', {
					global: true
				});
			}
		},

		_subLayerAddedQueryOnMap: function(res) {

			this._queryableLayersLoaded++;

			this._emitEvt('SET_MAP_QUERYABLE_CURSOR', {enable: true});

			var layerId = res.layerId,
				layerName = this._getLayerName(layerId);

			var parentTemplateDefinition = this._getTemplateForLayer(layerName, this.parentTemplateSuffix),
				childrenTemplateDefinition = this._getTemplateForLayer(layerName, this.childrenTemplateSuffix);

			this._emitEvt('ADD_NEW_TEMPLATES', {
				typeGroup: layerName,
				parentTemplate: parentTemplateDefinition,
				childrenTemplate: childrenTemplateDefinition
			});
		},

		_getLayerName: function(layerId) {

			var layerIdSplit = layerId.split(this.layerIdSeparator + this.layerIdPrefix);

			if (layerIdSplit.length > 1) {
				return layerIdSplit[0];
			}

			return layerId.split(this.layerIdSeparator)[0];
		},

		_getTemplateForLayer: function(layerName, suffix) {

			var specificTemplate = this._templatesByTypeGroup[layerName + suffix],
				typeGroup = layerName.split(this.layerThemeSeparator)[0],
				genericTemplate = this._templatesByTypeGroup[typeGroup + suffix] ||
					this._templatesByTypeGroup['default' + suffix],

				templateDefinition = specificTemplate ? specificTemplate : genericTemplate;

			if (!templateDefinition) {
				console.error('Layer templates definition is wrong, default template was not found.');
			}

			return templateDefinition;
		},

		_subLayerRemovedQueryOnMap: function(res) {

			this._queryableLayersLoaded--;
			if (!this._queryableLayersLoaded) {
				this._emitEvt('SET_MAP_QUERYABLE_CURSOR', {enable: false});
			}
		},

		_subLayerQueryingQueryOnMap: function(res) {

			this._layersWaiting++;
			clearTimeout(this._showInfoTimeoutHandler);
		},

		_subLayerInfoQueryOnMap: function(res) {

			this._layersWaiting--;

			this._processLayerInfo(res);
		},

		_processLayerInfo: function(res) {

			var layerId = res.layerId,
				layerLabel = res.layerLabel,
				layerInfo = res.info,
				isGeoJson = !!(layerInfo && layerInfo.features),
				hasFeatures = !!(isGeoJson && layerInfo.features.length),
				hasValidInfo = !!((!isGeoJson && layerInfo) || hasFeatures);

			if (hasValidInfo) {
				this._hadValidInfo = true;
				if (layerInfo instanceof Array) {
					for (var i = 0; i < layerInfo.length; i++) {
						this._loadInfo(layerId, layerLabel, layerInfo[i]);
					}
				} else {
					this._loadInfo(layerId, layerLabel, layerInfo);
				}
			}

			if (!this._layersWaiting) {
				this._showInfoTimeoutHandler = setTimeout(
					lang.hitch(this, this._showWhenNoLayersWaiting, this._hadValidInfo), 0);
			}
		},

		_loadInfo: function(layerId, layerLabel, layerInfo) {

			var infoData = this._getDataForAddInfo(layerId, layerLabel, layerInfo),
				typeGroup = this._getLayerName(layerId);

			infoData[this.typeGroupProperty] = typeGroup;

			this._emitEvt('ADD_INFO_DATA', infoData);
		},

		_showWhenNoLayersWaiting: function(hasValidInfo) {

			this._emitEvt('LOADED');

			if (hasValidInfo) {
				this._emitEvt('SHOW_LAYERS_INFO');
			} else {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.noLayerInfo
				});
			}

			this._hadValidInfo = false;
		},

		_getDataForAddInfo: function(layerId, layerLabel, data) {

			var layerIdPrefix = this._getLayerName(layerId),
				method;

			if (layerIdPrefix === "tracking") {
				method = '_getTrackingSpecificData';
			} else if (layerIdPrefix === "taxonDistribution") {
				method = '_getTaxonDistributionSpecificData';
			} else if (layerIdPrefix.indexOf(this.layerThemeSeparator) !== -1) {
				method = '_getThemeSpecificData';
			} else {
				method = '_showErrorOnGettingSpecificData';
			}
			return this[method](layerIdPrefix, layerLabel, data);
		},

		_getTrackingSpecificData: function(layerIdPrefix, layerLabel, data) {

			return {
				parent: lang.getObject("properties.element", false, data.features[0]),
				parentName: "name",
				children: data.features
			};
		},

		_getTaxonDistributionSpecificData: function(layerIdPrefix, layerLabel, data) {

			return {
				parent: data,
				parentName: function(parentData) {

					return "<i>" + parentData.scientificName + "</i> " + parentData.authorship;
				},
				children: data.citations.concat(data.animalTrackings)
			};
		},

		_getThemeSpecificData: function(layerIdPrefix, layerLabel, data) {

			return {
				parent: {
					name: layerLabel,
					id: layerIdPrefix
				},
				parentName: "name",
				children: data.features
			};
		},

		_showErrorOnGettingSpecificData: function(layerIdPrefix, layerLabel, data) {

			console.error('Received data with unknown type', layerIdPrefix, layerLabel, data);

			return {};
		}

	});
});
