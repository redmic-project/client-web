define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/AtlasPrimaryList'
	, 'templates/AtlasSecondaryList'
	, 'templates/AtlasRedpromarSecondaryList'
	, 'templates/TrackingPrimaryList'
	, 'templates/TrackingSecondaryList'
	, 'templates/SpeciesDistributionPrimaryList'
	, 'templates/SpeciesDistributionCitation'
], function(
	declare
	, lang
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
		//		Extensión del módulo para las tareas de identificar tipos de datos y correspondencia de capas con
		//		plantillas específicas.

		constructor: function(args) {

			this.config = {
				layerIdSeparator: '_',
				layerIdPrefix: 'layer-',
				layerThemeSeparator: '-',
				typeGroupProperty: 'dataType',
				parentTemplateSuffix: 'Parent',
				childrenTemplateSuffix: 'Children',

				_templatesByTypeGroup: {
					//	Podemos sobreescribir las plantillas genéricas de las capas
					//	de atlas especificando el nombre de la capa completo
					//'el-batimetriaIslasParent': AtlasPrimaryList',
					//'el-batimetriaIslasChildren': AtlasBathymetry',

					'defaultParent': AtlasPrimaryList,
					'defaultChildren': AtlasSecondaryList,

					'trackingParent': TrackingPrimaryList,
					'trackingChildren': TrackingSecondaryList,

					'taxonDistributionParent': SpeciesDistributionPrimaryList,
					'taxonDistributionChildren': {
						'ci': SpeciesDistributionCitation,
						'at': TrackingSecondaryList
					},

					'sd-full_sighting_taxon_yearChildren': AtlasRedpromarSecondaryList,
					'sd-exotic-species-sightingChildren': AtlasRedpromarSecondaryList
				}
			};

			lang.mixin(this, this.config, args);
		},

		_getLayerTemplatesDefinition: function(layerId) {

			var layerName = this._getLayerName(layerId),
				parentTemplateDefinition = this._getTemplateForLayer(layerName, this.parentTemplateSuffix),
				childrenTemplateDefinition = this._getTemplateForLayer(layerName, this.childrenTemplateSuffix);

			return {
				typeGroup: layerName,
				parentTemplate: parentTemplateDefinition,
				childrenTemplate: childrenTemplateDefinition
			};
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

		_processLayerInfo: function(res) {

			var layerId = res.layerId,
				layerLabel = res.layerLabel,
				layerInfo = res.info,
				isGeoJson = !!(layerInfo && layerInfo.features),
				hasFeatures = !!(isGeoJson && layerInfo.features.length),
				hasValidInfo = !!((!isGeoJson && layerInfo) || hasFeatures);

			if (!hasValidInfo) {
				return;
			}

			this._hadValidInfo = true;

			if (layerInfo instanceof Array) {
				for (var i = 0; i < layerInfo.length; i++) {
					this._loadInfo(layerId, layerLabel, layerInfo[i]);
				}
			} else {
				this._loadInfo(layerId, layerLabel, layerInfo);
			}
		},

		_loadInfo: function(layerId, layerLabel, layerInfo) {

			var infoData = this._getDataForAddInfo(layerId, layerLabel, layerInfo),
				typeGroup = this._getLayerName(layerId);

			infoData[this.typeGroupProperty] = typeGroup;

			this._emitEvt('ADD_INFO_DATA', infoData);
		},

		_getDataForAddInfo: function(layerId, layerLabel, data) {

			var layerIdPrefix = this._getLayerName(layerId),
				method;

			if (layerIdPrefix === 'tracking') {
				method = '_getTrackingSpecificData';
			} else if (layerIdPrefix === 'taxonDistribution') {
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
				parent: lang.getObject('properties.element', false, data.features[0]),
				parentName: 'name',
				children: data.features
			};
		},

		_getTaxonDistributionSpecificData: function(layerIdPrefix, layerLabel, data) {

			return {
				parent: data,
				parentName: function(parentData) {

					return '<i>' + parentData.scientificName + '</i> ' + parentData.authorship;
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
				parentName: 'name',
				children: data.features
			};
		},

		_showErrorOnGettingSpecificData: function(layerIdPrefix, layerLabel, data) {

			console.error('Received data with unknown type', layerIdPrefix, layerLabel, data);

			return {};
		}
	});
});
