define([
	'app/designs/base/_Main'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'src/component/atlas/_AtlasDimensionsManagement'
	, 'src/component/atlas/_AtlasLayersManagement'
	, 'src/component/map/LeafletImpl'
	, 'src/component/map/layer/WmsLayerImpl'
	, 'templates/ServiceOGCTitle'
	, 'templates/ServiceOGCInfo'
	, 'templates/ServiceOGCSourceInfo'
	, 'templates/ServiceOGCImage'
	, 'src/detail/_DetailRelatedToActivity'
], function(
	_Main
	, redmicConfig
	, declare
	, lang
	, TemplateDisplayer
	, _AtlasDimensionsManagement
	, _AtlasLayersManagement
	, LeafletImpl
	, WmsLayerImpl
	, TemplateTitle
	, TemplateInfo
	, TemplateSourceInfo
	, TemplateImage
	, _DetailRelatedToActivity
) {

	return declare([_DetailRelatedToActivity, _AtlasDimensionsManagement, _AtlasLayersManagement], {
		//	summary:
		//		Vista detalle de servicios OGC.

		constructor: function(args) {

			this.config = {
				atlasTarget: redmicConfig.services.atlasLayer,
				activityTarget: redmicConfig.services.activity,
				pathParent: redmicConfig.viewPaths.ogcServiceCatalog,
				infoLayerTarget: 'infoLayerTarget',
				sourceInfoLayerTarget: 'sourceInfoLayerTarget',
				templateTitle: TemplateTitle,
				templateInfo: TemplateInfo
			};

			lang.mixin(this, this.config, args);

			this.target = this.atlasTarget;
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				info: {
					height: 3,
					props: {
						target: this.infoLayerTarget
					}
				},
				sourceInfo: {
					width: 3,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: 'sourceInfo',
						template: TemplateSourceInfo,
						target: this.sourceInfoLayerTarget,
						'class': 'containerDetails',
						classEmptyTemplate: 'contentListNoData',
						associatedIds: [this.ownChannel],
						shownOption: this.shownOptionInfo
					}
				},
				activityList: {
					height: 3,
					props: {
						title: 'dataSource'
					}
				},
				spatialExtension: {
					width: 3,
					height: 3,
					type: LeafletImpl,
					props: {
						title: 'geograficFrame',
						omitContainerSizeCheck: true,
						maxZoom: 15,
						coordinatesViewer: false,
						navBar: false,
						miniMap: false,
						scaleBar: false,
						measureTools: false
					}
				},
				legend: {
					width: 3,
					height: 4,
					type: TemplateDisplayer,
					props: {
						title: 'legend',
						template: TemplateImage,
						'class': 'imageContainer',
						target: this.atlasTarget,
						associatedIds: [this.ownChannel]
					}
				}
			}]);
		},

		_publishMapBox: function(action, obj) {

			this._publish(this._getWidgetInstance('spatialExtension').getChannel(action), obj);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publishMapBox('CLEAR');

			if (this.layer) {
				this._publish(this.layer.getChannel('DESTROY'));
			}
		},

		_prepareActivityTarget: function() {

			this.target[1] = this.activityTarget;
		},

		_getActivityTargetData: function() {

			return;
		},

		_itemAvailable: function(response, resWrapper) {

			this.inherited(arguments);

			var target = resWrapper.target,
				data = response.data;

			if (target === this.activityTarget) {
				return;
			}

			this._handleAtlasItemAvailable(data);
		},

		_handleAtlasItemAvailable: function(data) {

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.infoLayerTarget
			});
			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.sourceInfoLayerTarget
			});

			this._publishMapBox('CLEAR');
			this._createMapBoundingLayer(data);
			this._retrieveLayerActivities(data);
			this._createMapLayer(data);
		},

		_createMapBoundingLayer: function(data) {

			if (data && data.geometry && data.geometry.coordinates) {
				this._addPolygon(data.geometry);
			}
		},

		_addPolygon: function(geometry) {

			this.layerPolygon = L.geoJson(geometry, {
				style: {
					color: 'red',
					fillOpacity: 0
				}
			});

			this._publishMapBox('ADD_LAYER', {
				layer: this.layerPolygon,
				layerId: 'boundingBox',
				layerLabel: this.i18n.boundingBox,
				optional: true
			});

			this._publishMapBox('FIT_BOUNDS', {
				bounds: this.layerPolygon.getBounds()
			});
		},

		_retrieveLayerActivities: function(data) {

			var activities = data.relatedActivities;

			if (!activities || !activities.length) {
				return;
			}

			for (var i = 0; i < activities.length; i++) {
				var activity = activities[i].activity;
				this._publish(this._buildChannel(this.storeChannel, this.actions.GET), {
					target: this.activityTarget,
					id: activity[this.idProperty]
				});
			}
		},

		_createMapLayer: function(data) {

			if (!data.urlSource || !data.name) {
				return;
			}

			var layerDefinition = this._getLayerDefinitionByProtocol(data);

			this.layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this._getWidgetInstance('spatialExtension').getChannel(),
				innerLayerDefinition: layerDefinition
			});

			this._publishMapBox('ADD_LAYER', {
				layer: this.layer,
				layerLabel: data.alias || data.name,
				atlasItem: data,
				optional: true
			});
		}
	});
});
