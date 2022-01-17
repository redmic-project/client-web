define([
	"app/designs/base/_Main"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'redmic/modules/layout/templateDisplayer/TemplateDisplayer'
	, 'redmic/modules/atlas/_AtlasLayersManagement'
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/layer/WmsLayerImpl"
	, "RWidgets/RedmicUtilities"
	, "templates/ServiceOGCTitle"
	, "templates/ServiceOGCInfo"
	, "templates/ServiceOGCSourceInfo"
	, "templates/ServiceOGCImage"
	, "./_DetailsBase"
], function(
	_Main
	, redmicConfig
	, declare
	, lang
	, TemplateDisplayer
	, _AtlasLayersManagement
	, LeafletImpl
	, WmsLayerImpl
	, RedmicUtilities
	, TemplateTitle
	, TemplateInfo
	, TemplateSourceInfo
	, TemplateImage
	, _DetailsBase
) {

	return declare([_DetailsBase, _AtlasLayersManagement], {
		//	summary:
		//		Vista detalle de servicios OGC.

		constructor: function(args) {

			this.atlasTarget = redmicConfig.services.atlasLayer;
			this.activityTarget = redmicConfig.services.activity;
			this.target = this.atlasTarget;
			this.selectionTarget = redmicConfig.services.atlasLayerSelection;

			this.activityLocalTarget = "activitiesLayer";
			this.infoLayerTarget = 'infoLayerTarget';
			this.sourceInfoLayerTarget = 'sourceInfoLayerTarget';

			this.config = {
				templateTitle: TemplateTitle,
				templateInfo: TemplateInfo
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.target.push(this.activityTarget);

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
						title: this.i18n.sourceInfo,
						template: TemplateSourceInfo,
						target: this.sourceInfoLayerTarget,
						"class": "containerDetails",
						classEmptyTemplate: "contentListNoData",
						associatedIds: [this.ownChannel],
						shownOption: this.shownOptionInfo
					}
				},
				activityList: {
					height: 3,
					props: {
						title: this.i18n.dataSource,
						target: this.activityLocalTarget
					}
				},
				spatialExtensionMap: {
					width: 3,
					height: 3,
					type: LeafletImpl,
					props: {
						title: this.i18n.geograficFrame,
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
						title: this.i18n.legend,
						template: TemplateImage,
						"class": "imageContainer",
						target: this.atlasTarget,
						associatedIds: [this.ownChannel]
					}
				}
			}]);
		},

		_publishMapBox: function(action, obj) {

			this._publish(this._getWidgetInstance('spatialExtensionMap').getChannel(action), obj);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('activityList').getChannel('CLEAR'));

			this._publishMapBox('CLEAR');

			if (this.layer) {
				this._publish(this.layer.getChannel('DESTROY'));
			}
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.atlasTarget,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(response, resObj) {

			var target = resObj.target,
				data = response.data;

			if (target === this.activityTarget) {
				this._handleActivityItemAvailable(data);
			} else {
				this._handleAtlasItemAvailable(data);
			}
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
				mapChannel: this._getWidgetInstance('spatialExtensionMap').getChannel(),
				layerDefinition: layerDefinition
			});

			this._publishMapBox('ADD_LAYER', {
				layer: this.layer,
				layerLabel: data.alias || data.name,
				optional: true
			});
		},

		_handleActivityItemAvailable: function(activity) {

			activity.rank = RedmicUtilities.getActivityRankByPath(activity.path);

			this._emitEvt('INJECT_ITEM', {
				data: activity,
				target: this.activityLocalTarget
			});
		}
	});
});
